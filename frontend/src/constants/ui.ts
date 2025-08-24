// Breakpoints
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
} as const;

export const media = {
  mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `@media (max-width: ${BREAKPOINTS.tablet}px)`,
};
