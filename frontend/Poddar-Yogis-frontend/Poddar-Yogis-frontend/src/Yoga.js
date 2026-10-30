import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Link, useNavigate } from 'react-router-dom';
import { count } from './utils/music';

import Instructions from './Instructions';
import './Yoga.css';

import { poseImages } from './utils/pose_images';
import { POINTS } from './utils/data';
import { drawPoint, drawSegment } from './utils/helper';

// --- BIOMECHANICAL & ANALYTICS ENGINES ---
import { smoothKeypoints, evaluatePoseBiomechanics } from './utils/biomechanics';
import { StabilityTracker } from './utils/stabilityTracker';
import { audioCoach } from './utils/audioCoach';
import { saveSessionRecord } from './utils/db';
import { computeSessionScorecard } from './utils/scorecard';
import DiagnosticModal from './DiagnosticModal';

// Anatomical bone connections with proper hip and leg attachments
const anatomicalConnections = [
  // Head
  [POINTS.NOSE, POINTS.LEFT_EYE],
  [POINTS.NOSE, POINTS.RIGHT_EYE],
  [POINTS.LEFT_EYE, POINTS.LEFT_EAR],
  [POINTS.RIGHT_EYE, POINTS.RIGHT_EAR],
  // Shoulders & Torso
  [POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER],
  [POINTS.LEFT_SHOULDER, POINTS.LEFT_HIP],
  [POINTS.RIGHT_SHOULDER, POINTS.RIGHT_HIP],
  [POINTS.LEFT_HIP, POINTS.RIGHT_HIP],
  // Arms
  [POINTS.LEFT_SHOULDER, POINTS.LEFT_ELBOW],
  [POINTS.LEFT_ELBOW, POINTS.LEFT_WRIST],
  [POINTS.RIGHT_SHOULDER, POINTS.RIGHT_ELBOW],
  [POINTS.RIGHT_ELBOW, POINTS.RIGHT_WRIST],
  // Legs (direct attachment from Hips to Knees to Ankles)
  [POINTS.LEFT_HIP, POINTS.LEFT_KNEE],
  [POINTS.LEFT_KNEE, POINTS.LEFT_ANKLE],
  [POINTS.RIGHT_HIP, POINTS.RIGHT_KNEE],
  [POINTS.RIGHT_KNEE, POINTS.RIGHT_ANKLE],
];

let poseList = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
  'Shoulderstand', 'Triangle'
];

const CLASS_NO = {
  Chair: 0,
  Cobra: 1,
  Dog: 2,
  No_Pose: 3,
  Shoulderstand: 4,
  Triangle: 5,
  Traingle: 5,
  Tree: 6,
  Warrior: 7,
};

// --- NORMALIZATION & EMBEDDING FUNCTIONS ---
function get_center_point(landmarks, left_bodypart, right_bodypart) {
  let left = tf.gather(landmarks, left_bodypart, 1);
  let right = tf.gather(landmarks, right_bodypart, 1);
  const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
  return center;
}

function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
  let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
  let shoulders_center = get_center_point(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER);
  let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
  let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
  pose_center_new = tf.expandDims(pose_center_new, 1);

  pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
  let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
  let max_dist = tf.max(tf.norm(d, 'euclidean', 0));

  let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist);
  return pose_size;
}

function normalize_pose_landmarks(landmarks) {
  let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
  pose_center = tf.expandDims(pose_center, 1);
  pose_center = tf.broadcastTo(pose_center, [1, 17, 2]);
  landmarks = tf.sub(landmarks, pose_center);

  let pose_size = get_pose_size(landmarks);
  landmarks = tf.div(landmarks, pose_size);
  return landmarks;
}

function landmarks_to_embedding(landmarks) {
  landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0));
  let embedding = tf.reshape(landmarks, [1, 34]);
  return embedding;
}

function classifyPose(poseClassifier, input) {
  return tf.tidy(() => {
    const processedInput = landmarks_to_embedding(input);
    const classification = poseClassifier.predict(processedInput);
    return classification.arraySync();
  });
}

function Yoga() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const flagRef = useRef(false);
  const timeoutRef = useRef(null);
  const detectorRef = useRef(null);
  const classifierRef = useRef(null);
  const countAudioRef = useRef(null);
  const isMountedRef = useRef(true);

  // Biomechanical engine refs
  const prevKeypointsRef = useRef(null);
  const stabilityTrackerRef = useRef(new StabilityTracker(15, 20.0));
  const rollingWindowRef = useRef([]); // 5-frame rolling ML probability
  const telemetryRef = useRef({
    stabilityScores: [],
    symmetryScores: [],
    accuracyScores: [],
    hyperextensionCount: 0,
    correctionsLog: []
  });

  // State
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [currentPose, setCurrentPose] = useState('Tree');
  const [isStartPose, setIsStartPose] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [cameraOrientation, setCameraOrientation] = useState('landscape'); // 'landscape' (640x480) or 'portrait' (480x640)

  // Track hold duration with precision
  const lastTimestampRef = useRef(Date.now());

  useEffect(() => {
    setPoseTime(0);
    setBestPerform(0);
    flagRef.current = false;
    prevKeypointsRef.current = null;
    rollingWindowRef.current = [];
    stabilityTrackerRef.current.reset();
    telemetryRef.current = {
      stabilityScores: [],
      symmetryScores: [],
      accuracyScores: [],
      hyperextensionCount: 0,
      correctionsLog: []
    };
  }, [currentPose]);

  useEffect(() => {
    isMountedRef.current = true;
    runMovenet(true);
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countAudioRef.current) {
        countAudioRef.current.pause();
        countAudioRef.current.currentTime = 0;
      }
      audioCoach.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectPose = useCallback(async (detector, poseClassifier, countAudio) => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');

      if (videoWidth && videoHeight) {
        if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
        }
      }

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      let pose = [];
      try {
        pose = await detector.estimatePoses(video);
      } catch (detErr) {
        console.warn('Pose estimation error:', detErr);
        return;
      }

      if (!pose || pose.length === 0 || !pose[0].keypoints) {
        flagRef.current = false;
        countAudio.pause();
        countAudio.currentTime = 0;
        return;
      }

      try {
        const rawKeypoints = pose[0].keypoints;

        // --- TEMPORAL SMOOTHING (EMA) ---
        const keypoints = smoothKeypoints(prevKeypointsRef.current, rawKeypoints, 0.65);
        prevKeypointsRef.current = keypoints;

        let notDetected = 0;
        let input = keypoints.map((kp) => {
          if (kp.score < 0.35) notDetected += 1;
          return [kp.x, kp.y];
        });

        // --- STABILITY & MICRO-MOVEMENT ANALYSIS ---
        const stability = stabilityTrackerRef.current.update(keypoints, 0.35);

        // --- STRICT KINEMATICS & POSE GEOMETRY ---
        const biomech = evaluatePoseBiomechanics(currentPose, keypoints, 0.35);

        // --- CLASSIFICATION & RIGIDITY FILTER ---
        let isPoseRecognized = false;
        let currentAccuracyPct = 80;

        if (notDetected <= 4) {
          const data = classifyPose(poseClassifier, input);
          const classNo = CLASS_NO[currentPose];
          const rawScore = data && data[0] ? data[0][classNo] : 0;

          // Rolling 5-frame average with hysteresis
          rollingWindowRef.current.push(rawScore);
          if (rollingWindowRef.current.length > 5) {
            rollingWindowRef.current.shift();
          }
          const avgScore = rollingWindowRef.current.reduce((a, b) => a + b, 0) / rollingWindowRef.current.length;
          currentAccuracyPct = Math.round(avgScore * 100);

          // BALANCED CHECK:
          // Recognizes real posture smoothly (>0.70) while verifying essential anatomy
          if (avgScore > 0.70 && biomech.isGeometricallyValid) {
            isPoseRecognized = true;
          }
        }

        // --- DRAW SKELETON WITH ANATOMICAL CONTINUITY ---
        // 1. Draw Bones (segments)
        anatomicalConnections.forEach(([p1Idx, p2Idx]) => {
          const kp1 = keypoints[p1Idx];
          const kp2 = keypoints[p2Idx];
          if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
            let lineColor = isPoseRecognized ? 'rgb(0, 255, 0)' : 'rgb(255, 255, 255)';
            if (biomech.jointStatus[p1Idx] === 'error' || biomech.jointStatus[p2Idx] === 'error') {
              lineColor = 'rgb(239, 68, 68)';
            }
            drawSegment(ctx, [kp1.x, kp1.y], [kp2.x, kp2.y], lineColor);
          }
        });

        // 2. Draw Joints (points)
        keypoints.forEach((kp, idx) => {
          if (kp.score > 0.35 && !(kp.name === 'left_eye' || kp.name === 'right_eye')) {
            let ptColor = isPoseRecognized ? 'rgb(0, 255, 0)' : 'rgb(255, 255, 255)';
            let ptSize = 6;

            if (biomech.jointStatus[idx] === 'error') {
              ptColor = 'rgb(239, 68, 68)'; // Red
              ptSize = 9;
            } else if (biomech.jointStatus[idx] === 'warning') {
              ptColor = 'rgb(245, 158, 11)'; // Orange
              ptSize = 8;
            }

            drawPoint(ctx, kp.x, kp.y, ptSize, ptColor);
          }
        });

        // --- TIMER & AUDIO FEEDBACK LOGIC ---
        const now = Date.now();
        const deltaSeconds = (now - lastTimestampRef.current) / 1000;
        lastTimestampRef.current = now;

        if (isPoseRecognized) {
          if (!flagRef.current) {
            countAudio.play().catch((audioErr) => console.warn('Audio notice:', audioErr));
            flagRef.current = true;
          }

          // Accumulates hold time naturally while in pose
          setPoseTime((prev) => {
            const newTime = prev + deltaSeconds;
            setBestPerform((best) => Math.max(best, newTime));
            return newTime;
          });

          // Spoken guidance for minor adjustments
          if (biomech.topCorrection) {
            audioCoach.speak(biomech.topCorrection);
          }

          // Log telemetry
          telemetryRef.current.stabilityScores.push(stability.stabilityPercentage);
          telemetryRef.current.symmetryScores.push(biomech.symmetry.isSymmetric ? 95 : 70);
          telemetryRef.current.accuracyScores.push(currentAccuracyPct);
          if (biomech.hyperAlerts.length > 0) {
            telemetryRef.current.hyperextensionCount += biomech.hyperAlerts.length;
          }
          if (biomech.topCorrection && !telemetryRef.current.correctionsLog.includes(biomech.topCorrection)) {
            telemetryRef.current.correctionsLog.push(biomech.topCorrection);
          }
        } else {
          flagRef.current = false;
          countAudio.pause();
          countAudio.currentTime = 0;

          // Provide guidance when attempting pose
          if (biomech.topCorrection && notDetected <= 3) {
            audioCoach.speak(biomech.topCorrection);
          }
        }
      } catch (err) {
        console.log('Detection frame processing error:', err);
      }
    }
  }, [currentPose]);

  const scheduleNextDetection = useCallback((detector, poseClassifier, countAudio) => {
    timeoutRef.current = setTimeout(async () => {
      await detectPose(detector, poseClassifier, countAudio);
      if (isMountedRef.current) {
        scheduleNextDetection(detector, poseClassifier, countAudio);
      }
    }, 30);
  }, [detectPose]);

  const runMovenet = async (isPreload = false) => {
    if (detectorRef.current && classifierRef.current) {
      if (!isPreload) {
        setIsModelLoading(false);
        lastTimestampRef.current = Date.now();
        scheduleNextDetection(detectorRef.current, classifierRef.current, countAudioRef.current);
      }
      return;
    }

    if (!isPreload) {
      setIsModelLoading(true);
      setLoadError(null);
    }

    try {
      try {
        await tf.setBackend('webgl');
      } catch (webglError) {
        console.warn('WebGL unavailable, falling back to CPU:', webglError);
        await tf.setBackend('cpu');
      }
      await tf.ready();

      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

      let poseClassifier;
      try {
        poseClassifier = await tf.loadLayersModel(process.env.PUBLIC_URL + '/model/model.json');
      } catch (localModelErr) {
        console.warn('Local model load failed, attempting fallback:', localModelErr);
        poseClassifier = await tf.loadLayersModel(
          'https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json'
        );
      }

      const countAudio = new Audio(count);
      countAudio.loop = true;

      detectorRef.current = detector;
      classifierRef.current = poseClassifier;
      countAudioRef.current = countAudio;

      if (!isMountedRef.current) return;

      setIsModelLoading(false);
      if (!isPreload) {
        lastTimestampRef.current = Date.now();
        scheduleNextDetection(detector, poseClassifier, countAudio);
      }
    } catch (err) {
      console.error('Pose model loading failed:', err);
      if (isMountedRef.current && !isPreload) {
        setIsModelLoading(false);
        setLoadError('Pose model error: ' + (err.message || 'Check camera/network connection.'));
      }
    }
  };

  function startYoga() {
    setIsStartPose(true);
    setScorecard(null);
    lastTimestampRef.current = Date.now();
    stabilityTrackerRef.current.reset();

    if (detectorRef.current && classifierRef.current) {
      setIsModelLoading(false);
      scheduleNextDetection(detectorRef.current, classifierRef.current, countAudioRef.current);
    } else {
      runMovenet(false);
    }
  }

  async function stopPose() {
    setIsStartPose(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countAudioRef.current) {
      countAudioRef.current.pause();
      countAudioRef.current.currentTime = 0;
    }
    audioCoach.stop();
    flagRef.current = false;

    // --- AUTO-SAVE SESSION SCORECARD TO INDEXEDDB ---
    if (poseTime > 0.5) {
      const card = computeSessionScorecard({
        poseName: currentPose,
        durationSeconds: poseTime,
        stabilityScores: telemetryRef.current.stabilityScores,
        symmetryScores: telemetryRef.current.symmetryScores,
        accuracyScores: telemetryRef.current.accuracyScores,
        hyperextensionCount: Math.min(5, Math.round(telemetryRef.current.hyperextensionCount / 15)),
        correctionsLog: telemetryRef.current.correctionsLog
      });

      setScorecard(card);
      await saveSessionRecord(card);
    }
  }

  if (isStartPose) {
    return (
      <div className="yoga-container">
        {isModelLoading && (
          <div className="starting-contdown">
            <h1>Loading model...</h1>
          </div>
        )}

        {loadError && (
          <div className="starting-contdown" style={{ borderRadius: '12px', maxWidth: '80%', padding: '16px' }}>
            <h1>{loadError}</h1>
            <button
              onClick={runMovenet}
              className="secondary-btn"
              style={{ position: 'static', margin: '15px auto', display: 'block' }}
            >
              Retry Loading Model
            </button>
          </div>
        )}

        <div className={`studio-stage ${cameraOrientation}`}>
          <div className={`camera-card ${cameraOrientation}`}>
            <div className="performance-container">
              <div className="pose-performance">
                <h4>Pose Time: {poseTime.toFixed(1)} s</h4>
              </div>
              <div className="pose-performance">
                <h4>Best: {bestPerform.toFixed(1)} s</h4>
              </div>
              <div className="orientation-toggle-group">
                <button
                  type="button"
                  className={`btn-orientation ${cameraOrientation === 'landscape' ? 'active' : ''}`}
                  onClick={() => setCameraOrientation('landscape')}
                  title="Switch to Landscape Mode (Wide 4:3)"
                >
                  🖥️ Landscape
                </button>
                <button
                  type="button"
                  className={`btn-orientation ${cameraOrientation === 'portrait' ? 'active' : ''}`}
                  onClick={() => setCameraOrientation('portrait')}
                  title="Switch to Portrait Mode (Tall Full-Body 3:4)"
                >
                  📱 Portrait
                </button>
              </div>
            </div>

            <Webcam
              width={cameraOrientation === 'landscape' ? 640 : 480}
              height={cameraOrientation === 'landscape' ? 480 : 640}
              id="webcam"
              ref={webcamRef}
              videoConstraints={{
                width: cameraOrientation === 'landscape' ? 640 : 480,
                height: cameraOrientation === 'landscape' ? 480 : 640,
                facingMode: 'user',
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                padding: '0px',
              }}
            />
            <canvas
              ref={canvasRef}
              id="my-canvas"
              width={cameraOrientation === 'landscape' ? 640 : 480}
              height={cameraOrientation === 'landscape' ? 480 : 640}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
              }}
            />
          </div>

          <div className={`pose-card ${cameraOrientation}`}>
            <h3 className="pose-card-title">
              <span>🎯 Target:</span> {currentPose} Pose
            </h3>
            <img src={poseImages[currentPose]} className="pose-img" alt={`${currentPose} Target Reference`} />
          </div>
        </div>

        <button onClick={stopPose} className="secondary-btn" style={{ position: 'static', margin: '24px auto', display: 'block' }}>
          Stop Pose
        </button>
      </div>
    );
  }

  // Pre-Practice Selection Screen
  return (
    <div className="yoga-container">
      {/* Studio Navigation Bar */}
      <nav className="studio-nav-bar">
        <Link to="/" className="studio-logo">Poddar Yogis</Link>
        <div className="studio-nav-links">
          <Link to="/progress" className="studio-link">📊 Analytics & Progress</Link>
          <Link to="/tutorials" className="studio-link">📖 Tutorials</Link>
          <Link to="/about" className="studio-link">ℹ️ About</Link>
        </div>
      </nav>

      {/* 10-Second Auto-Closing Diagnostic Scorecard Modal */}
      {scorecard && (
        <DiagnosticModal
          scorecard={scorecard}
          onClose={() => setScorecard(null)}
          onViewHistory={() => navigate('/progress')}
        />
      )}

      <div className="dropdown-wrapper">
        <select
          value={currentPose}
          onChange={(e) => setCurrentPose(e.target.value)}
          className="pose-dropdown"
        >
          {(poseList || []).map((pose) => (
            <option key={pose} value={pose}>
              {pose} Pose
            </option>
          ))}
        </select>
      </div>

      <Instructions currentPose={currentPose} />

      <button onClick={startYoga} className="secondary-btn" style={{ marginTop: '20px' }}>
        Start Pose
      </button>
    </div>
  );
}

export default Yoga;