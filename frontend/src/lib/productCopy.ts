/** User-facing product strings — keep career count and brand name in sync. */
export const PRODUCT_NAME = 'Outcave';
/** Landing stats: avoid fabricated precision (e.g. fake “12,847+”). */
export const LANDING_STUDENTS_STAT_VALUE = 'Many';
export const LANDING_STUDENTS_STAT_LABEL = 'Students exploring';
/** Rounded marketing label; seeded catalogue is ~99 careers. */
export const CAREER_CATALOG_LABEL = '100+';
/** Must match backend/config/pricing.py REPORT_PRICE_INR (teaser + checkout display). */
export const REPORT_PRICE_INR = 49;
/** Premium bundle: extra questions + full report — match backend PREMIUM_BUNDLE_PRICE_INR. */
export const PREMIUM_BUNDLE_PRICE_INR = 99;
/** Delta when upgrading from report-only to bundle — match backend PREMIUM_UPGRADE_FROM_REPORT_INR. */
export const PREMIUM_UPGRADE_FROM_REPORT_INR = PREMIUM_BUNDLE_PRICE_INR - REPORT_PRICE_INR;

/** Match backend `_build_teaser` overview copy (game_assessment/views.py) for consistency. */
export const DIRECTIONAL_SNAPSHOT_TITLE = 'Directional snapshot';
export const DIRECTIONAL_SNAPSHOT_BODY =
  'This preview is from your first assessment only. It is useful for discussion and early ' +
  'exploration, but it is not the most stable read for final decisions. For maximum accuracy, ' +
  `choose the premium bundle (₹${PREMIUM_BUNDLE_PRICE_INR}): you complete extra questions, then unlock the full career ` +
  'report based on your refined profile. You can also unlock the report from this run alone ' +
  `for ₹${REPORT_PRICE_INR} if you prefer.`;
