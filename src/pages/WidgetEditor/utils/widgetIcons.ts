export const SHUFFLE_SVG =
  '<svg class="nnc-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="M2 6h1.4c1.3 0 2.5.6 3.3 1.7l.5.7"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/></svg>'

// The header logo (public/logos/logo.png) as a stroke and two dots, so it stays a few hundred bytes.
const LOGO_VIEW_BOX = '80 40 470 330'
const LOGO_PATH = 'M135 295V185a85 85 0 0 1 170 0v40a87.5 87.5 0 0 0 175 0V105'

export const MARK_SVG = `<svg class="nnc-mark" viewBox="${LOGO_VIEW_BOX}" aria-hidden="true"><path d="${LOGO_PATH}" fill="none" stroke="currentColor" stroke-width="56"/><circle cx="135" cy="297" r="40" fill="currentColor"/><circle cx="482" cy="106" r="38" fill="currentColor"/></svg>`

export const GRADIENT_LOGO_SVG = `<svg class="nnc-logo" viewBox="${LOGO_VIEW_BOX}" aria-hidden="true"><defs><linearGradient id="nnc-grad" gradientUnits="userSpaceOnUse" x1="100" y1="60" x2="520" y2="340"><stop offset="0" stop-color="#ef506c"/><stop offset="1" stop-color="#b46cf2"/></linearGradient></defs><path d="${LOGO_PATH}" fill="none" stroke="url(#nnc-grad)" stroke-width="56"/><circle cx="135" cy="297" r="40" fill="#bf6ad8"/><circle cx="482" cy="106" r="38" fill="#bd72e6"/></svg>`
