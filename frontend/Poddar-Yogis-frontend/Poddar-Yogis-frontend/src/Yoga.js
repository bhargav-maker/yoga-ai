import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Link, useNavigate } from 'react-router-dom';
import { count } from './utils/music';

import Instructions from './Instructions';
import './Yoga.css';

import { poseImages } from './utils/pose_images';
import { POINTS, keypointConnections } from './utils/data';
import { drawPoint, drawSegment } from './utils/helper';

// --- BIOMECHANICAL & ANALYTICS ENGINES ---
import { smoothKeypoints, evaluatePoseBiomechanics } from './utils/biomechanics';
import { StabilityTracker } from './utils/stabilityTracker';
import { audioCoach } from './utils/audioCoach';
import { BreathingEngine } from './utils/breathingEngine';
import { saveSessionRecord } from './utils/db';
import { computeSessionScorecard } from './utils/scorecard';
import DiagnosticModal from './DiagnosticModal';

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
  const stabilityTrackerRef = useRef(new StabilityTracker(15, 24.0));
  const breathingEngineRef = useRef(new BreathingEngine(4000, 4000, 4000));
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

  // Live posture state & feedback
  const [isPoseAligned, setIsPoseAligned] = useState(false);
  const [currentCorrection, setCurrentCorrection] = useState(null);
  const [liveAccuracy, setLiveAccuracy] = useState(0);

  // Post-pose scorecard modal
  const [scorecard, setScorecard] = useState(null);

  // Strict delta tracking to completely eliminate the 1793358968.5s epoch time bug
  const lastTickTimeRef = useRef(Date.now());

  useEffect(() => {
    setPoseTime(0);
    setBestPerform(0);
    flagRef.current = false;
    prevKeypointsRef.current = null;
    rollingWindowRef.current = [];
    stabilityTrackerRef.current.reset();
    breathingEngineRef.current.reset();
    setIsPoseAligned(false);
    setCurrentCorrection(null);
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
        return;
      }

      try {
        const rawKeypoints = pose[0].keypoints;

        // --- FEATURE 7: TEMPORAL SMOOTHING (EMA) ---
        const keypoints = smoothKeypoints(prevKeypointsRef.current, rawKeypoints, 0.65);
        prevKeypointsRef.current = keypoints;

        let notDetected = 0;
        let input = keypoints.map((kp) => {
          if (kp.score < 0.35) notDetected += 1;
          return [kp.x, kp.y];
        });

        // --- FEATURE 2: STABILITY & MICRO-MOVEMENT ANALYSIS ---
        const stability = stabilityTrackerRef.current.update(keypoints, 0.35);

        // --- BALANCED BIOMECHANICAL EVALUATION (Sanity checks) ---
        const biomech = evaluatePoseBiomechanics(currentPose, keypoints, 0.30);
        setCurrentCorrection(biomech.topCorrection);

        // --- FEATURE 5: CLEAN PRANAYAMA BREATHING AURA ---
        const lSh = keypoints[POINTS.LEFT_SHOULDER];
        const rSh = keypoints[POINTS.RIGHT_SHOULDER];
        if (lSh && rSh && lSh.score > 0.3 && rSh.score > 0.3) {
          breathingEngineRef.current.drawAura(
            ctx,
            (lSh.x + rSh.x) / 2,
            (lSh.y + rSh.y) / 2 + 15,
            24
          );
        }

        // --- BALANCED DETECTION ENGINE (ML + Biomechanical Sanity Checks) ---
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
          setLiveAccuracy(currentAccuracyPct);

          // Balanced Detection:
          // Must achieve good ML confidence (>0.82) AND pass basic sanity checks
          if (avgScore > 0.94 || (avgScore > 0.82 && biomech.isGeometricallyValid)) {
            isPoseRecognized = true;
          }
        }
        setIsPoseAligned(isPoseRecognized);

        // --- SKELETON DRAWING (Full Anatomical Connections) ---
        // 1. Draw bones first
        keypoints.forEach((kp, idx) => {
          if (kp.score > 0.30 && !(kp.name === 'left_eye' || kp.name === 'right_eye')) {
            const connections = keypointConnections[kp.name];
            if (connections) {
              connections.forEach((conn) => {
                const targetIdx = POINTS[conn.toUpperCase()];
                if (targetIdx !== undefined && keypoints[targetIdx] && keypoints[targetIdx].score > 0.25) {
                  let lineColor = isPoseRecognized ? 'rgb(16, 185, 129)' : 'rgba(255, 255, 255, 0.7)';
                  if (biomech.jointStatus[idx] === 'error' || biomech.jointStatus[targetIdx] === 'error') {
                    lineColor = 'rgb(239, 68, 68)';
                  }
                  drawSegment(
                    ctx,
                    [kp.x, kp.y],
                    [keypoints[targetIdx].x, keypoints[targetIdx].y],
                    lineColor
                  );
                }
              });
            }
          }
        });

        // 2. Draw joints over bones
        keypoints.forEach((kp, idx) => {
          if (kp.score > 0.30 && !(kp.name === 'left_eye' || kp.name === 'right_eye')) {
            let ptColor = isPoseRecognized ? 'rgb(16, 185, 129)' : 'rgb(255, 255, 255)';
            let ptSize = 7;

            if (biomech.jointStatus[idx] === 'error') {
              ptColor = 'rgb(239, 68, 68)';
              ptSize = 10;
            } else if (biomech.jointStatus[idx] === 'warning') {
              ptColor = 'rgb(245, 158, 11)';
              ptSize = 8;
            }

            drawPoint(ctx, kp.x, kp.y, ptSize, ptColor);
          }
        });

        // --- DELTA-TIME ACCUMULATION (ELIMINATES 1793358968.5s BUG) ---
        const now = Date.now();
        const deltaSeconds = (now - lastTickTimeRef.current) / 1000;
        lastTickTimeRef.current = now;

        // Cap deltaSeconds to avoid giant jumps if tab was backgrounded
        const safeDelta = Math.min(0.1, Math.max(0, deltaSeconds));

        if (isPoseRecognized) {
          if (!flagRef.current) {
            countAudio.play().catch((audioErr) => console.warn('Audio notice:', audioErr));
            flagRef.current = true;
          }

          // Accumulate strictly in safe increments when stable
          if (stability.isStable) {
            setPoseTime((prev) => {
              const updated = prev + safeDelta;
              setBestPerform((best) => Math.max(best, updated));
              return updated;
            });
          }

          if (biomech.topCorrection) {
            audioCoach.speak(biomech.topCorrection);
          }

          telemetryRef.current.stabilityScores.push(stability.stabilityPercentage);
          telemetryRef.current.symmetryScores.push(biomech.symmetry.isSymmetric ? 95 : 75);
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
        lastTickTimeRef.current = Date.now();
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
        lastTickTimeRef.current = Date.now();
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
    lastTickTimeRef.current = Date.now();
    breathingEngineRef.current.reset();
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

    // Save diagnostic scorecard
    if (poseTime > 1.0) {
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

  // --- MODERN AI STUDIO VIEW ---
  if (isStartPose) {
    return (
      <div className="yoga-container">
        {/* Navigation Bar */}
        <nav className="studio-nav-bar">
          <Link to="/" className="studio-logo">
            <span>🧘</span> Yoga AI Studio
          </Link>
          <div className="studio-nav-links">
            <Link to="/progress" className="studio-link">📊 Analytics</Link>
            <Link to="/tutorials" className="studio-link">📖 Tutorials</Link>
          </div>
        </nav>

        {/* Studio Stage */}
        <div className="studio-stage">
          {/* Main Camera Card */}
          <div className="camera-frame-card">
            {/* Top HUD Pill */}
            <div className="camera-hud-overlay">
              <div className="hud-pill">
                <span className="hud-time-val">⏱️ {poseTime.toFixed(1)}s</span>
                <span className="hud-best-val">Best: {bestPerform.toFixed(1)}s</span>
              </div>
              <span className={`hud-status-badge ${isPoseAligned ? 'aligned' : 'adjusting'}`}>
                {isPoseAligned ? '● Aligned (30 FPS)' : '○ Adjusting Pose'}
              </span>
            </div>

            {/* Video & Skeleton Canvas */}
            <Webcam
              width={640}
              height={480}
              id="webcam"
              ref={webcamRef}
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
            />
            <canvas
              ref={canvasRef}
              id="my-canvas"
              width={640}
              height={480}
            />

            {/* In-Frame Correction Toast */}
            {currentCorrection && (
              <div className="camera-correction-toast">
                <span className="correction-icon">⚠️</span>
                <p className="correction-msg">{currentCorrection}</p>
              </div>
            )}
          </div>

          {/* Right Target Reference Sidebar */}
          <div className="target-sidebar-card">
            <div className="target-header">
              <div>
                <span className="target-label">Target Pose</span>
                <h3 className="target-name">{currentPose} Pose</h3>
              </div>
            </div>

            {/* Fully uncropped reference pose image */}
            <div className="pose-img-container">
              <img 
                src={poseImages[currentPose]} 
                className="pose-img" 
                alt={`${currentPose} target guidance`} 
              />
            </div>

            {/* Real-time mini metrics */}
            <div className="target-metrics-mini">
              <div className="mini-stat-item">
                <span className="mini-stat-label">Accuracy</span>
                <span className="mini-stat-val">{liveAccuracy}%</span>
              </div>
              <div className="mini-stat-item">
                <span className="mini-stat-label">AI Inference</span>
                <span className="mini-stat-val" style={{ color: '#10b981' }}>MoveNet (Local)</span>
              </div>
            </div>

            <button onClick={stopPose} className="btn-stop-pose">
              Stop Pose & View Report 📋
            </button>
          </div>
        </div>

        {isModelLoading && (
          <div className="starting-contdown">
            <h1>Initializing MoveNet Vision Model...</h1>
          </div>
        )}

        {loadError && (
          <div className="starting-contdown" style={{ borderRadius: '14px', maxWidth: '80%' }}>
            <h1>{loadError}</h1>
            <button
              onClick={runMovenet}
              className="btn-start-hero"
              style={{ padding: '8px 20px', fontSize: '14px', marginTop: '10px' }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // Pre-Practice Selection Screen
  return (
    <div className="yoga-container">
      {/* Studio Navigation Bar */}
      <nav className="studio-nav-bar">
        <Link to="/" className="studio-logo">
          <span>🧘</span> Yoga AI Studio
        </Link>
        <div className="studio-nav-links">
          <Link to="/progress" className="studio-link">📊 Analytics & History</Link>
          <Link to="/tutorials" className="studio-link">📖 Tutorials</Link>
          <Link to="/about" className="studio-link">ℹ️ About</Link>
        </div>
      </nav>

      {/* Post-Pose Diagnostic Scorecard Modal with 10s Auto-Close */}
      {scorecard && (
        <DiagnosticModal
          scorecard={scorecard}
          onClose={() => setScorecard(null)}
          onViewHistory={() => navigate('/progress')}
        />
      )}

      <div className="pre-practice-container">
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

        <button onClick={startYoga} className="btn-start-hero">
          Start {currentPose} Pose 🧘
        </button>
      </div>
    </div>
  );
}

export default Yoga;