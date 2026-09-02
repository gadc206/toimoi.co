import { prisma } from "@/lib/db";
import { ALGORITHM_VERSION, MATCH_ENGINE_MODE } from "@/lib/matching/config";

export const CALIBRATION_THRESHOLDS = {
  bilateralOutcomes: 200,
  secondDates: 50,
} as const;

export async function getCalibrationReport() {
  const metrics = await prisma.matchingAnalytics.summary();
  const eligibleForStatisticalLearning =
    metrics.bilateralOutcomes >= CALIBRATION_THRESHOLDS.bilateralOutcomes &&
    metrics.secondDates >= CALIBRATION_THRESHOLDS.secondDates;
  return {
    mode: MATCH_ENGINE_MODE,
    algorithmVersion: ALGORITHM_VERSION,
    ...metrics,
    eligibleForStatisticalLearning,
    remaining: {
      bilateralOutcomes: Math.max(
        0,
        CALIBRATION_THRESHOLDS.bilateralOutcomes - metrics.bilateralOutcomes,
      ),
      secondDates: Math.max(0, CALIBRATION_THRESHOLDS.secondDates - metrics.secondDates),
    },
    policy: eligibleForStatisticalLearning
      ? "Eligible for held-out evaluation of a regularized interpretable domain model; no automatic weight changes."
      : "Expert-configured weights remain locked. Continue shadow review and outcome collection.",
  };
}
