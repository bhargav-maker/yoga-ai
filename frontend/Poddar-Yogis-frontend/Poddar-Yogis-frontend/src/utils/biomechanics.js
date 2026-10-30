/**
 * Biomechanical Analysis & Geometric Engine for Yoga AI
 * Implements 3-point angle calculation, strict pose-specific kinematic rules
 * (preventing cheating: unjoined hands, kickbacks, air-legs),
 * slope-based symmetry detection, hyperextension boundary alerts,
 * and temporal landmark EMA smoothing.
 */

import { POINTS } from './data';

// Exponential Moving Average (EMA) smoothing for keypoint coordinates
export function smoothKeypoints(prevKeypoints, currentKeypoints, alpha = 0.65) {
  if (!prevKeypoints || prevKeypoints.length === 0) return currentKeypoints;
  return currentKeypoints.map((curr, idx) => {
    const prev = prevKeypoints[idx];
    if (!prev) return curr;
    return {
      ...curr,
      x: alpha * curr.x + (1 - alpha) * prev.x,
      y: alpha * curr.y + (1 - alpha) * prev.y,
      score: curr.score,
    };
  });
}

/**
 * Calculates 2D Euclidean distance between two points
 */
export function calculateDistance(a, b) {
  if (!a || !b) return null;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates 2D interior angle in degrees between three points: A -> B -> C
 * B is the vertex.
 */
export function calculateAngle(a, b, c) {
  if (!a || !b || !c) return null;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Checks for hyperextension in hinge joints (knees and elbows).
 * A hinge angle pushing past ~177° towards reverse deflection indicates locked/hyperextended joints.
 */
export function checkHyperextension(keypoints, minScore = 0.35) {
  const alerts = [];
  const joints = {};

  const p = (idx) => keypoints[idx] && keypoints[idx].score >= minScore ? keypoints[idx] : null;

  // Left Knee: Hip -> Knee -> Ankle
  const lHip = p(POINTS.LEFT_HIP);
  const lKnee = p(POINTS.LEFT_KNEE);
  const lAnkle = p(POINTS.LEFT_ANKLE);
  if (lHip && lKnee && lAnkle) {
    const angle = calculateAngle(lHip, lKnee, lAnkle);
    if (angle !== null) {
      joints.leftKneeAngle = angle;
      if (angle >= 177) {
        alerts.push({
          joint: 'Left Knee',
          jointIndex: POINTS.LEFT_KNEE,
          angle,
          message: 'Softly bend your left knee — avoid locking the joint.',
          severity: 'warning'
        });
      }
    }
  }

  // Right Knee: Hip -> Knee -> Ankle
  const rHip = p(POINTS.RIGHT_HIP);
  const rKnee = p(POINTS.RIGHT_KNEE);
  const rAnkle = p(POINTS.RIGHT_ANKLE);
  if (rHip && rKnee && rAnkle) {
    const angle = calculateAngle(rHip, rKnee, rAnkle);
    if (angle !== null) {
      joints.rightKneeAngle = angle;
      if (angle >= 177) {
        alerts.push({
          joint: 'Right Knee',
          jointIndex: POINTS.RIGHT_KNEE,
          angle,
          message: 'Softly bend your right knee — avoid locking the joint.',
          severity: 'warning'
        });
      }
    }
  }

  // Left Elbow: Shoulder -> Elbow -> Wrist
  const lShoulder = p(POINTS.LEFT_SHOULDER);
  const lElbow = p(POINTS.LEFT_ELBOW);
  const lWrist = p(POINTS.LEFT_WRIST);
  if (lShoulder && lElbow && lWrist) {
    const angle = calculateAngle(lShoulder, lElbow, lWrist);
    if (angle !== null) {
      joints.leftElbowAngle = angle;
      if (angle >= 178) {
        alerts.push({
          joint: 'Left Elbow',
          jointIndex: POINTS.LEFT_ELBOW,
          angle,
          message: 'Ease tension in left elbow — keep a micro-bend.',
          severity: 'caution'
        });
      }
    }
  }

  // Right Elbow: Shoulder -> Elbow -> Wrist
  const rShoulder = p(POINTS.RIGHT_SHOULDER);
  const rElbow = p(POINTS.RIGHT_ELBOW);
  const rWrist = p(POINTS.RIGHT_WRIST);
  if (rShoulder && rElbow && rWrist) {
    const angle = calculateAngle(rShoulder, rElbow, rWrist);
    if (angle !== null) {
      joints.rightElbowAngle = angle;
      if (angle >= 178) {
        alerts.push({
          joint: 'Right Elbow',
          jointIndex: POINTS.RIGHT_ELBOW,
          angle,
          message: 'Ease tension in right elbow — keep a micro-bend.',
          severity: 'caution'
        });
      }
    }
  }

  return { alerts, joints };
}

/**
 * Evaluates relative slope symmetry between shoulders and hips relative to ground.
 */
export function checkSlopeSymmetry(keypoints, minScore = 0.35) {
  const p = (idx) => keypoints[idx] && keypoints[idx].score >= minScore ? keypoints[idx] : null;
  const lShoulder = p(POINTS.LEFT_SHOULDER);
  const rShoulder = p(POINTS.RIGHT_SHOULDER);
  const lHip = p(POINTS.LEFT_HIP);
  const rHip = p(POINTS.RIGHT_HIP);

  if (!lShoulder || !rShoulder || !lHip || !rHip) {
    return { isSymmetric: true, deltaDegrees: 0, warning: null };
  }

  const shoulderAngle = Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x) * (180 / Math.PI);
  const hipAngle = Math.atan2(rHip.y - lHip.y, rHip.x - lHip.x) * (180 / Math.PI);
  const deltaDegrees = Math.round(Math.abs(shoulderAngle - hipAngle));

  const isSymmetric = deltaDegrees <= 14;
  return {
    isSymmetric,
    deltaDegrees,
    shoulderAngle: Math.round(shoulderAngle),
    hipAngle: Math.round(hipAngle),
    warning: !isSymmetric ? `Pelvic or shoulder tilt detected (${deltaDegrees}°). Square your hips.` : null
  };
}

/**
 * Pose-Specific Biomechanical Evaluation
 * Strictly validates essential anatomical constraints (hands, folded legs, orientation)
 * to prevent false positives and pose cheating.
 */
export function evaluatePoseBiomechanics(poseName, keypoints, minScore = 0.35) {
  const p = (idx) => keypoints[idx] && keypoints[idx].score >= minScore ? keypoints[idx] : null;
  const errors = [];
  const jointStatus = {}; // map of keypoint index -> status ('correct' | 'warning' | 'error')

  // Core landmarks
  const lHip = p(POINTS.LEFT_HIP);
  const rHip = p(POINTS.RIGHT_HIP);
  const lKnee = p(POINTS.LEFT_KNEE);
  const rKnee = p(POINTS.RIGHT_KNEE);
  const lAnkle = p(POINTS.LEFT_ANKLE);
  const rAnkle = p(POINTS.RIGHT_ANKLE);
  const lShoulder = p(POINTS.LEFT_SHOULDER);
  const rShoulder = p(POINTS.RIGHT_SHOULDER);
  const lElbow = p(POINTS.LEFT_ELBOW);
  const rElbow = p(POINTS.RIGHT_ELBOW);
  const lWrist = p(POINTS.LEFT_WRIST);
  const rWrist = p(POINTS.RIGHT_WRIST);

  // Torso scale reference
  let torsoLength = 150;
  if (lShoulder && lHip) {
    torsoLength = calculateDistance(lShoulder, lHip) || 150;
  } else if (rShoulder && rHip) {
    torsoLength = calculateDistance(rShoulder, rHip) || 150;
  }

  const lKneeAngle = lHip && lKnee && lAnkle ? calculateAngle(lHip, lKnee, lAnkle) : null;
  const rKneeAngle = rHip && rKnee && rAnkle ? calculateAngle(rHip, rKnee, rAnkle) : null;
  const lElbowAngle = lShoulder && lElbow && lWrist ? calculateAngle(lShoulder, lElbow, lWrist) : null;
  const rElbowAngle = rShoulder && rElbow && rWrist ? calculateAngle(rShoulder, rElbow, rWrist) : null;

  switch (poseName) {
    case 'Tree': {
      // 1. SMART HANDS CHECK: Wrists must be joined or in close prayer/overhead position
      if (lWrist && rWrist) {
        const wristDist = calculateDistance(lWrist, rWrist);
        // Hands within 65% of torso length allow comfortable Anjali mudra or overhead reach
        if (wristDist !== null && wristDist > torsoLength * 0.65) {
          errors.push({ priority: 1, message: 'Bring hands together in prayer or clasp overhead.' });
          jointStatus[POINTS.LEFT_WRIST] = 'warning';
          jointStatus[POINTS.RIGHT_WRIST] = 'warning';
        }
      }

      // 2. SMART LEG CHECK: One straight standing leg, one folded leg
      if (lKneeAngle !== null && rKneeAngle !== null) {
        // Left folded, right standing
        const leftIsFolded = lKneeAngle < 145 && rKneeAngle > 130;
        // Right folded, left standing
        const rightIsFolded = rKneeAngle < 145 && lKneeAngle > 130;

        if (!leftIsFolded && !rightIsFolded) {
          errors.push({ priority: 1, message: 'Stand firmly on one straight leg and bend the other.' });
          jointStatus[POINTS.LEFT_KNEE] = 'warning';
          jointStatus[POINTS.RIGHT_KNEE] = 'warning';
        } else if (lAnkle && rAnkle) {
          // Verify folded foot is lifted off the ground
          if (leftIsFolded && lAnkle.y >= rAnkle.y - 15) {
            errors.push({ priority: 1, message: 'Lift your folded foot off the floor onto your inner leg.' });
            jointStatus[POINTS.LEFT_ANKLE] = 'warning';
          } else if (rightIsFolded && rAnkle.y >= lAnkle.y - 15) {
            errors.push({ priority: 1, message: 'Lift your folded foot off the floor onto your inner leg.' });
            jointStatus[POINTS.RIGHT_ANKLE] = 'warning';
          }
        }
      }
      break;
    }

    case 'Chair': {
      // Chair pose: both knees bent (75° to 140°), both feet grounded
      if (lKneeAngle !== null && lKneeAngle > 145) {
        errors.push({ priority: 2, message: 'Bend your knees deeper into chair stance.' });
        jointStatus[POINTS.LEFT_KNEE] = 'warning';
      }
      if (rKneeAngle !== null && rKneeAngle > 145) {
        if (!errors.some(e => e.message.includes('knees deeper'))) {
          errors.push({ priority: 2, message: 'Bend your knees deeper into chair stance.' });
        }
        jointStatus[POINTS.RIGHT_KNEE] = 'warning';
      }
      // Torso should be angled forward, arms raised
      if (lWrist && lShoulder && lWrist.y > lShoulder.y + 20) {
        errors.push({ priority: 2, message: 'Raise both arms upward alongside ears.' });
        jointStatus[POINTS.LEFT_WRIST] = 'warning';
      }
      break;
    }

    case 'Warrior': {
      // Warrior: One leg bent, back leg extended
      if (lKneeAngle !== null && rKneeAngle !== null) {
        const hasBentAndStraight = (lKneeAngle < 130 && rKneeAngle > 140) || (rKneeAngle < 130 && lKneeAngle > 140);
        if (!hasBentAndStraight) {
          errors.push({ priority: 1, message: 'Lunge deeper: front knee bent, back leg straight.' });
          jointStatus[POINTS.LEFT_KNEE] = 'warning';
          jointStatus[POINTS.RIGHT_KNEE] = 'warning';
        }
      }
      break;
    }

    case 'Dog': {
      // Downward Dog: Inverted V, arms and legs extended
      if (lKneeAngle !== null && lKneeAngle < 135) {
        errors.push({ priority: 2, message: 'Lengthen your hamstrings and straighten legs.' });
        jointStatus[POINTS.LEFT_KNEE] = 'warning';
      }
      if ((lElbowAngle !== null && lElbowAngle < 135) || (rElbowAngle !== null && rElbowAngle < 135)) {
        errors.push({ priority: 2, message: 'Press through palms and extend your arms.' });
        if (lElbowAngle !== null && lElbowAngle < 135) jointStatus[POINTS.LEFT_ELBOW] = 'warning';
        if (rElbowAngle !== null && rElbowAngle < 135) jointStatus[POINTS.RIGHT_ELBOW] = 'warning';
      }
      break;
    }

    case 'Cobra': {
      // Cobra: Chest lifted, hips low
      if (lShoulder && lHip) {
        if (lShoulder.y >= lHip.y - 10) {
          errors.push({ priority: 1, message: 'Lift your chest and gaze upward gently.' });
          jointStatus[POINTS.LEFT_SHOULDER] = 'warning';
        }
      }
      break;
    }

    case 'Triangle':
    case 'Traingle': {
      // Triangle: Front leg extended without deep bend
      if (lKneeAngle !== null && lKneeAngle < 140 && rKneeAngle !== null && rKneeAngle < 140) {
        errors.push({ priority: 2, message: 'Keep legs extended without excessive knee bend.' });
        jointStatus[POINTS.LEFT_KNEE] = 'warning';
      }
      break;
    }

    case 'Shoulderstand': {
      // Shoulderstand: legs vertical, hips above shoulders
      if (lHip && lShoulder && lHip.y >= lShoulder.y) {
        errors.push({ priority: 1, message: 'Elevate your hips and torso vertically above shoulders.' });
        jointStatus[POINTS.LEFT_HIP] = 'warning';
      }
      break;
    }

    default:
      break;
  }

  // Check hyperextension
  const { alerts: hyperAlerts } = checkHyperextension(keypoints, minScore);
  hyperAlerts.forEach(alert => {
    errors.push({ priority: 1, message: alert.message });
    jointStatus[alert.jointIndex] = 'error';
  });

  // Check symmetry
  const symmetry = checkSlopeSymmetry(keypoints, minScore);
  if (symmetry.warning && errors.length === 0) {
    errors.push({ priority: 2, message: symmetry.warning });
    jointStatus[POINTS.LEFT_SHOULDER] = 'warning';
    jointStatus[POINTS.RIGHT_SHOULDER] = 'warning';
  }

  // Sort errors by priority (1 = highest urgency)
  errors.sort((a, b) => a.priority - b.priority);

  return {
    isGeometricallyValid: errors.length === 0,
    errors,
    topCorrection: errors.length > 0 ? errors[0].message : null,
    jointStatus,
    hyperAlerts,
    symmetry
  };
}
