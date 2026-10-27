import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect, useCallback } from 'react'
import Webcam from 'react-webcam'
import { count } from './utils/music'; 
 
import Instructions from './Instructions';
import './Yoga.css'
 
import { poseImages } from './utils/pose_images';
import { POINTS, keypointConnections } from './utils/data';
import { drawPoint, drawSegment } from './utils/helper'

let skeletonColor = 'rgb(255,255,255)'
let poseList = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
  'Shoulderstand', 'Triangle'
]

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
}

// --- PURE HELPER FUNCTIONS ---
function get_center_point(landmarks, left_bodypart, right_bodypart) {
  let left = tf.gather(landmarks, left_bodypart, 1)
  let right = tf.gather(landmarks, right_bodypart, 1)
  const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
  return center
}

function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
  let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
  let shoulders_center = get_center_point(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
  let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
  let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
  pose_center_new = tf.expandDims(pose_center_new, 1)

  pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2])
  let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
  let max_dist = tf.max(tf.norm(d, 'euclidean', 0))

  let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
  return pose_size
}

function normalize_pose_landmarks(landmarks) {
  let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
  pose_center = tf.expandDims(pose_center, 1)
  pose_center = tf.broadcastTo(pose_center, [1, 17, 2])
  landmarks = tf.sub(landmarks, pose_center)

  let pose_size = get_pose_size(landmarks)
  landmarks = tf.div(landmarks, pose_size)
  return landmarks
}

function landmarks_to_embedding(landmarks) {
  landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0))
  let embedding = tf.reshape(landmarks, [1, 34])
  return embedding
}

function classifyPose(poseClassifier, input) {
  return tf.tidy(() => {
    const processedInput = landmarks_to_embedding(input)
    const classification = poseClassifier.predict(processedInput)
    return classification.arraySync()
  })
}

function Yoga() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const flagRef = useRef(false)
  const timeoutRef = useRef(null)
  const detectorRef = useRef(null)
  const classifierRef = useRef(null)
  const countAudioRef = useRef(null)
  const isMountedRef = useRef(true)

  const [startingTime, setStartingTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [poseTime, setPoseTime] = useState(0)
  const [bestPerform, setBestPerform] = useState(0)
  const [currentPose, setCurrentPose] = useState('Tree')
  const [isStartPose, setIsStartPose] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000
    if (flagRef.current) {
      setPoseTime(timeDiff)
      if (timeDiff > bestPerform) {
        setBestPerform(timeDiff)
      }
    }
  }, [currentTime, startingTime, bestPerform])

  useEffect(() => {
    setCurrentTime(0)
    setStartingTime(0)
    setPoseTime(0)
    setBestPerform(0)
    flagRef.current = false
  }, [currentPose])

  useEffect(() => {
    isMountedRef.current = true
    // Preload model in background so clicking "Start Pose" is instantaneous with zero wait time!
    runMovenet(true)
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (countAudioRef.current) {
        countAudioRef.current.pause()
        countAudioRef.current.currentTime = 0
      }
    }
  }, [])

  const detectPose = useCallback(async (detector, poseClassifier, countAudio) => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0
      const video = webcamRef.current.video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      if (!canvasRef.current) return
      const ctx = canvasRef.current.getContext('2d')

      // Ensure canvas internal coordinate space matches video pixel resolution
      if (videoWidth && videoHeight) {
        if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
          canvasRef.current.width = videoWidth
          canvasRef.current.height = videoHeight
        }
      }

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      let pose = []
      try {
        pose = await detector.estimatePoses(video)
      } catch (detErr) {
        console.warn('Pose estimation error:', detErr)
        return
      }

      if (!pose || pose.length === 0 || !pose[0].keypoints) {
        return
      }

      try {
        const keypoints = pose[0].keypoints
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)')
              let connections = keypointConnections[keypoint.name]
              if (connections) {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase()
                  let targetIdx = POINTS[conName]
                  if (targetIdx !== undefined && keypoints[targetIdx] && keypoints[targetIdx].score > 0.3) {
                    drawSegment(
                      ctx,
                      [keypoint.x, keypoint.y],
                      [keypoints[targetIdx].x, keypoints[targetIdx].y],
                      skeletonColor
                    )
                  }
                })
              }
            }
          } else {
            notDetected += 1
          }
          return [keypoint.x, keypoint.y]
        })

        if (notDetected > 4) {
          skeletonColor = 'rgb(255,255,255)'
          return
        }

        const data = classifyPose(poseClassifier, input)
        const classNo = CLASS_NO[currentPose]

        if (data && data[0] && data[0][classNo] > 0.97) {
          if (!flagRef.current) {
            countAudio.play().catch((audioErr) => console.warn('Audio play notice:', audioErr))
            setStartingTime(new Date().getTime())
            flagRef.current = true
          }
          setCurrentTime(new Date().getTime())
          skeletonColor = 'rgb(0,255,0)'
        } else {
          flagRef.current = false
          skeletonColor = 'rgb(255,255,255)'
          countAudio.pause()
          countAudio.currentTime = 0
        }
      } catch (err) {
        console.log('Detection frame processing error:', err)
      }
    }
  }, [currentPose])

  const scheduleNextDetection = useCallback((detector, poseClassifier, countAudio) => {
    timeoutRef.current = setTimeout(async () => {
      await detectPose(detector, poseClassifier, countAudio)
      if (isMountedRef.current) {
        scheduleNextDetection(detector, poseClassifier, countAudio)
      }
    }, 30)
  }, [detectPose])

  const runMovenet = async (isPreload = false) => {
    if (detectorRef.current && classifierRef.current) {
      if (!isPreload) {
        setIsModelLoading(false)
        scheduleNextDetection(detectorRef.current, classifierRef.current, countAudioRef.current)
      }
      return
    }

    if (!isPreload) {
      setIsModelLoading(true)
      setLoadError(null)
    }

    try {
      // --- SAFE BACKEND INITIALIZATION (WebGL -> CPU Fallback) ---
      try {
        await tf.setBackend('webgl')
      } catch (webglError) {
        console.warn('WebGL backend unavailable, falling back to CPU:', webglError)
        await tf.setBackend('cpu')
      }
      await tf.ready()

      // SINGLEPOSE_LIGHTNING is 4x faster to download and runs at 30-60 FPS real-time
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig)
      
      let poseClassifier
      try {
        // Try local model first (fast, reliable, offline-ready)
        poseClassifier = await tf.loadLayersModel(process.env.PUBLIC_URL + '/model/model.json')
      } catch (localModelErr) {
        console.warn('Local model load failed, attempting remote url fallback:', localModelErr)
        poseClassifier = await tf.loadLayersModel(
          'https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json'
        )
      }

      const countAudio = new Audio(count)
      countAudio.loop = true

      detectorRef.current = detector
      classifierRef.current = poseClassifier
      countAudioRef.current = countAudio

      if (!isMountedRef.current) return

      setIsModelLoading(false)
      if (!isPreload) {
        scheduleNextDetection(detector, poseClassifier, countAudio)
      }
    } catch (err) {
      console.error('Pose model loading failed:', err)
      if (isMountedRef.current && !isPreload) {
        setIsModelLoading(false)
        setLoadError('Pose model error: ' + (err.message || 'Check camera/network connection.'))
      }
    }
  }

  function startYoga() {
    setIsStartPose(true)
    if (detectorRef.current && classifierRef.current) {
      setIsModelLoading(false)
      scheduleNextDetection(detectorRef.current, classifierRef.current, countAudioRef.current)
    } else {
      runMovenet(false)
    }
  }

  function stopPose() {
    setIsStartPose(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (countAudioRef.current) {
      countAudioRef.current.pause()
      countAudioRef.current.currentTime = 0
    }
    flagRef.current = false
    skeletonColor = 'rgb(255,255,255)'
  }

  if (isStartPose) {
    return (
      <div className="yoga-container">
        <div className="performance-container">
          <div className="pose-performance">
            <h4>Pose Time: {poseTime.toFixed(1)} s</h4>
          </div>
          <div className="pose-performance">
            <h4>Best: {bestPerform.toFixed(1)} s</h4>
          </div>
        </div>
        {isModelLoading && (
          <div className="starting-contdown">
            <h1>Loading model...</h1>
          </div>
        )}
        {loadError && (
          <div className="starting-contdown" style={{ borderRadius: '12px', maxWidth: '80%', padding: '16px' }}>
            <h1>{loadError}</h1>
            <button onClick={runMovenet} className="secondary-btn" style={{ position: 'static', margin: '15px auto', display: 'block' }}>
              Retry Loading Model
            </button>
          </div>
        )}
        <div>
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
            style={{
              position: 'absolute',
              left: 120,
              top: 100,
              padding: '0px',
            }}
          />
          <canvas
            ref={canvasRef}
            id="my-canvas"
            width={640}
            height={480}
            style={{
              position: 'absolute',
              left: 120,
              top: 100,
              zIndex: 1,
            }}
          ></canvas>
          <div>
            <img src={poseImages[currentPose]} className="pose-img" alt="Pose Target" />
          </div>
        </div>
        <button onClick={stopPose} className="secondary-btn">
          Stop Pose
        </button>
      </div>
    )
  }

  return (
    <div className="yoga-container">
      <div className="dropdown-wrapper">
        <select
          value={currentPose}
  onChange={(e) => setCurrentPose(e.target.value)}
  className="pose-dropdown"
>
  {(poseList || []).map((pose) => (
    <option key={pose} value={pose}>
      {pose}
    </option>
  ))}
       </select>

      </div>
      <Instructions currentPose={currentPose} />
      <button onClick={startYoga} className="secondary-btn">
        Start Pose
      </button>
    </div>
  )
}

export default Yoga