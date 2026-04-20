/**
 * theme.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central place to customise the look of the app.
 * Change brand color, fonts, and the hero image here
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AppTheme {
  /** Primary brand color — used for the main CTA button and links */
  primaryColor: string;
  /** Hover state for primary button */
  primaryHover: string;
  /** Font for headings and the brand mark */
  headingFont: string;
  /** Font for body text and inputs */
  bodyFont: string;
  /** URL for the right-panel hero image */
  heroImageUrl: string;
  /** Overlay color on top of the hero image (use rgba for transparency) */
  heroOverlay: string;
  /** Quote shown on the hero panel — set to '' to hide */
  heroQuote: string;
  /** Quote attribution */
  heroQuoteAuthor: string;
}

export const APP_THEME: AppTheme = {
  /**  TODO: Change colors to match figma mock */
  primaryColor: '#2563EB',          // swap for brand color
  primaryHover: '#1D4ED8',
  headingFont: "'DM Serif Display', Georgia, serif",
  bodyFont: "'DM Sans', system-ui, sans-serif",

  // Hero panel
  // Replace URL With mock image or similar
  heroImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
  heroOverlay: 'rgba(15, 23, 42, 0.45)',

  heroQuote: 'The future belongs to those who believe in the beauty of their dreams.',
  heroQuoteAuthor: '— Eleanor Roosevelt',
};