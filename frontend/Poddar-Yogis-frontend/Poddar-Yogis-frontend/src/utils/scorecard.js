/**
 * Automated Diagnostic Scorecard & Metrics Engine for Yoga AI
 * Computes multi-factor biomechanical ratings, session aggregation,
 * and prescriptive clinical mobility recommendations.
 */

export function computeSessionScorecard({
  poseName,
  durationSeconds = 0,
  stabilityScores = [],
  symmetryScores = [],
  accuracyScores = [],
  hyperextensionCount = 0,
  correctionsLog = []
}) {
  const avgStability = stabilityScores.length > 0
    ? Math.round(stabilityScores.reduce((a, b) => a + b, 0) / stabilityScores.length)
    : 85;

  const avgSymmetry = symmetryScores.length > 0
    ? Math.round(symmetryScores.reduce((a, b) => a + b, 0) / symmetryScores.length)
    : 90;

  const avgAccuracy = accuracyScores.length > 0
    ? Math.round(accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length)
    : 88;

  // Weighted overall calculation with deduction for injury-risk hyperextensions
  let rawScore = (0.35 * avgAccuracy) + (0.35 * avgStability) + (0.30 * avgSymmetry);
  rawScore -= (hyperextensionCount * 8);
  const overallScore = Math.max(15, Math.min(100, Math.round(rawScore)));

  // Determine performance tier & title
  let grade = 'Developing Form 🌱';
  let badgeColor = '#94a3b8';
  if (overallScore >= 90) {
    grade = 'Master Alignment 🌟';
    badgeColor = '#10b981';
  } else if (overallScore >= 80) {
    grade = 'Proficient Yogi 🧘';
    badgeColor = '#0ea5e9';
  } else if (overallScore >= 70) {
    grade = 'Intermediate Balance 🌿';
    badgeColor = '#f59e0b';
  } else {
    badgeColor = '#ef4444';
  }

  // Generate actionable mobility & physical therapy recommendations
  const recommendations = [];
  if (hyperextensionCount > 0) {
    recommendations.push('⚠️ Joint Safety: Maintain a 2° micro-bend in knees and elbows to engage stabilizing muscles and prevent ligament strain.');
  }
  if (avgStability < 75) {
    recommendations.push('⚖️ Balance Work: Focus gaze on an unmoving focal point (Drishti) and strengthen ankle proprioceptors.');
  }
  if (avgSymmetry < 80) {
    recommendations.push('📐 Pelvic & Shoulder Leveling: Avoid dumping weight into one side; engage core obliques to square hips.');
  }
  if (recommendations.length === 0) {
    recommendations.push('✨ Excellent Form! Your biomechanical symmetry, joint safety, and balance were within clinical standards.');
  }

  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    poseName,
    durationSeconds: Math.round(durationSeconds * 10) / 10,
    overallScore,
    grade,
    badgeColor,
    metrics: {
      stability: avgStability,
      symmetry: avgSymmetry,
      accuracy: avgAccuracy,
      hyperextensionCount
    },
    recommendations,
    correctionsCount: correctionsLog.length
  };
}
