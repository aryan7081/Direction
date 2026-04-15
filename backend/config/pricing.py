"""
Canonical report price in INR (full career report unlock).

Change this value to update teaser + Razorpay everywhere. Env vars are not
used so a stale REPORT_PRICE_INR=299 in .env cannot override this.
"""

REPORT_PRICE_INR = 49
PREMIUM_BUNDLE_PRICE_INR = 99
# Delta for users who already paid for the ₹49 report and upgrade to the premium bundle.
PREMIUM_UPGRADE_FROM_REPORT_INR = PREMIUM_BUNDLE_PRICE_INR - REPORT_PRICE_INR
