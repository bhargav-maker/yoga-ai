/**
 * Biomechanical Analysis & Geometric Engine for Yoga AI
 * Implements 3-point angle calculation, balanced pose-specific sanity rules,
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
 * Calculates 2D Euclidean distance between two points
 */
export function calculateDistance(a, b) {
  if (!a || !b) return null;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks for hyperextension in hinge joints (knees and elbows).
 * Only alerts on genuine reverse deflection (>177°) without false alarms.
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
      if (angle >= 178) {
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
      if (angle >= 178) {
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
      if (angle >= 179) {
        alerts.push({
          joint: 'Left Elbow',
          jointIndex: POINTS.LEFT_ELBOW,
          angle,
          message: 'Keep a micro-bend in left elbow.',
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
      if (angle >= 179) {
        alerts.push({
          joint: 'Right Elbow',
          jointIndex: POINTS.RIGHT_ELBOW,
          angle,
          message: 'Keep a micro-bend in right elbow.',
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

  const isSymmetric = deltaDegrees <= 15;
  return {
    isSymmetric,
    deltaDegrees,
    shoulderAngle: Math.round(shoulderAngle),
    hipAngle: Math.round(hipAngle),
    warning: !isSymmetric ? `Square your shoulders and hips.` : null
  };
}

/**
 * Balanced Biomechanical Evaluation (Sanity checks, not robotic strictness)
 * Ensures user isn't cheating (e.g., hands separated or leg kicked in air),
 * but remains forgiving of minor body differences.
 */
export function evaluatePoseBiomechanics(poseName, keypoints, minScore = 0.30) {
  const p = (idx) => keypoints[idx] && keypoints[idx].score >= minScore ? keypoints[idx] : null;
  const errors = [];
  const jointStatus = {};

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

  const lKneeAngle = lHip && lKnee && lAnkle ? calculateAngle(lHip, lKnee, lAnkle) : null;
  const rKneeAngle = rHip && rKnee && rAnkle ? calculateAngle(rHip, rKnee, rAnkle) : null;
  const lElbowAngle = lShoulder && lElbow && lWrist ? calculateAngle(lShoulder, lElbow, lWrist) : null;
  const rElbowAngle = rShoulder && rElbow && rWrist ? calculateAngle(rShoulder, rElbow, rWrist) : null;

  // Scale reference: torso distance (shoulder midpoint to hip midpoint)
  let torsoDist = 120;
  if (lShoulder && rShoulder && lHip && rHip) {
    const sMid = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 };
    const hMid = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };
    torsoDist = calculateDistance(sMid, hMid) || 120;
  }

  // Hand proximity check (for poses requiring joined hands like Tree / Anjali Mudra)
  const wristDist = (lWrist && rWrist) ? calculateDistance(lWrist, rWrist) : null;

  switch (poseName) {
    case 'Tree': {
      // 1. Hands sanity: wrists should be relatively close (e.g. within 1.0 * torso distance)
      if (wristDist !== null && wristDist > torsoDist * 1.05) {
        errors.push({ priority: 3, message: 'Bring your palms closer into prayer position.' });
        if (lWrist) jointStatus[POINTS.LEFT_WRIST] = 'warning';
        if (rWrist) jointStatus[POINTS.RIGHT_WRIST] = 'warning';
      }

      // 2. Leg sanity: one leg standing (>135°), one leg folded in (<145°)
      // Allows natural variation whether foot is at ankle, calf, or inner thigh without false alerts
      if (lKneeAngle !== null && rKneeAngle !== null) {
        const leftFolded = lKneeAngle < 145 && rKneeAngle > 135;
        const rightFolded = rKneeAngle < 145 && lKneeAngle > 135;

        if (!leftFolded && !rightFolded) {
          errors.push({ priority: 2, message: 'Bend one knee outward to place foot on standing leg.' });
          jointStatus[POINTS.LEFT_KNEE] = 'warning';
          jointStatus[POINTS.RIGHT_KNEE] = 'warning';
        }
      }
      break;
    }

    case 'Chair': {
      // Both knees should show a visible bend (knee angles < 155°)
      if (lKneeAngle !== null && lKneeAngle > 155) {
        errors.push({ priority: 2, message: 'Bend knees deeper into chair pose.' });
        jointStatus[POINTS.LEFT_KNEE] = 'warning';
      }
      if (rKneeAngle !== null && rKneeAngle > 155) {
        if (!errors.some(e => e.message.includes('Bend knees'))) {
          errors.push({ priority: 2, message: 'Bend knees deeper into chair pose.' });
        }
        jointStatus[POINTS.RIGHT_KNEE] = 'warning';
      }
      break;
    }

    case 'Warrior': {
      // Front knee bent, back leg extended
      if (lKneeAngle !== null && rKneeAngle !== null) {
        const hasLunge = (lKneeAngle < 135 && rKneeAngle > 140) || (rKneeAngle < 135 && lKneeAngle > 140);
        if (!hasLunge) {
          errors.push({ priority: 2, message: 'Deepen your lunge: bend front knee, straighten back leg.' });
          jointStatus[POINTS.LEFT_KNEE] = 'warning';
          jointStatus[POINTS.RIGHT_KNEE] = 'warning';
        }
      }
      break;
    }

    case 'Dog': {
      // Downward Dog: arms extended
      if (lElbowAngle !== null && lElbowAngle < 130) {
        errors.push({ priority: 3, message: 'Press firmly through palms to extend arms.' });
        jointStatus[POINTS.LEFT_ELBOW] = 'warning';
      }
      if (rElbowAngle !== null && rElbowAngle < 130) {
        jointStatus[POINTS.RIGHT_ELBOW] = 'warning';
      }
      break;
    }

    case 'Cobra': {
      // Chest lifted above hips
      if (lShoulder && lHip && lShoulder.y >= lHip.y + 10) {
        errors.push({ priority: 1, message: 'Lift chest off the mat gently.' });
        jointStatus[POINTS.LEFT_SHOULDER] = 'warning';
      }
      break;
    }

    case 'Triangle':
    case 'Traingle': {
      if (lKneeAngle !== null && lKneeAngle < 135 && rKneeAngle !== null && rKneeAngle < 135) {
        errors.push({ priority: 2, message: 'Keep front leg straight in triangle stance.' });
        jointStatus[POINTS.LEFT_KNEE] = 'warning';
      }
      break;
    }

    case 'Shoulderstand': {
      if (lHip && lShoulder && lHip.y > lShoulder.y) {
        errors.push({ priority: 1, message: 'Elevate hips vertically above shoulders.' });
        jointStatus[POINTS.LEFT_HIP] = 'warning';
      }
      break;
    }

    default:
      break;
  }

  // Check general hyperextension
  const { alerts: hyperAlerts } = checkHyperextension(keypoints, minScore);
  hyperAlerts.forEach(alert => {
    errors.push({ priority: 1, message: alert.message });
    jointStatus[alert.jointIndex] = 'error';
  });

  // Check symmetry
  const symmetry = checkSlopeSymmetry(keypoints, minScore);
  if (symmetry.warning) {
    jointStatus[POINTS.LEFT_SHOULDER] = 'warning';
    jointStatus[POINTS.RIGHT_SHOULDER] = 'warning';
  }

  // Sort errors by priority
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
