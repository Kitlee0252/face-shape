import type { Point } from './types';
import { distance } from './geometry';

export interface PoseCheck {
  yawDeg: number;   // estimated left-right rotation (absolute)
  pitchDeg: number;  // estimated up-down tilt (absolute)
  warning: string | null; // null = ok, string = user-facing message
}

const POSE_THRESHOLD_DEG = 15;

/**
 * Estimate head pose from landmark asymmetry.
 *
 * Yaw (left-right turn): compare nose-to-left-cheek vs nose-to-right-cheek distances.
 * Pitch (up-down tilt): compare forehead-to-nose vs nose-to-chin vertical proportions.
 *
 * Landmarks used:
 * - 1: nose tip
 * - 234/454: left/right cheekbone (same as face shape measurement)
 * - 10: forehead top
 * - 152: chin
 */
export function estimateHeadPose(keypoints: Point[]): PoseCheck {
  const nose = keypoints[1];
  const leftCheek = keypoints[234];
  const rightCheek = keypoints[454];
  const forehead = keypoints[10];
  const chin = keypoints[152];

  // Yaw: asymmetry of nose-to-cheek distances (3D)
  const noseToLeft = distance(nose, leftCheek);
  const noseToRight = distance(nose, rightCheek);
  const maxDist = Math.max(noseToLeft, noseToRight);
  const yawAsymmetry = maxDist > 0 ? Math.abs(noseToLeft - noseToRight) / maxDist : 0;
  // Map asymmetry ~0-0.4 to degrees ~0-30 (empirical approximation)
  const yawDeg = yawAsymmetry * 75;

  // Pitch: ratio of upper face to lower face vertical extent
  const upperFace = Math.abs(forehead.y - nose.y);
  const lowerFace = Math.abs(nose.y - chin.y);
  const pitchRatio = lowerFace > 0 ? upperFace / lowerFace : 1;
  // Ideal ratio ~0.8-1.2 (frontal). Deviation maps to pitch.
  const pitchDeviation = Math.abs(pitchRatio - 1.0);
  const pitchDeg = pitchDeviation * 45;

  let warning: string | null = null;
  if (yawDeg > POSE_THRESHOLD_DEG && pitchDeg > POSE_THRESHOLD_DEG) {
    warning = 'Your head appears tilted. For best results, face the camera directly.';
  } else if (yawDeg > POSE_THRESHOLD_DEG) {
    warning = 'Your head appears turned to one side. Try facing the camera directly.';
  } else if (pitchDeg > POSE_THRESHOLD_DEG) {
    warning = 'Your head appears tilted up or down. Try looking straight at the camera.';
  }

  return { yawDeg: Math.round(yawDeg), pitchDeg: Math.round(pitchDeg), warning };
}
