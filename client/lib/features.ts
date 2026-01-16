export const FeatureFlags = {
  FEATURE_PATTERNS_V1: true,
  FEATURE_THEMES_V1: true,
  FEATURE_REVIEW_MODE_V1: true,
  FEATURE_EXPORT_V1: true,
  FEATURE_RESPONSIBILITY_THREADS_V2: false,
  FEATURE_TRUSTED_HANDS_V3: false,
  FEATURE_MOMENTS_OF_POWER_V4: false,
  FEATURE_ARCHIVE_MODE_V5: false,
} as const;

export function isFeatureEnabled(
  feature: keyof typeof FeatureFlags
): boolean {
  return FeatureFlags[feature];
}
