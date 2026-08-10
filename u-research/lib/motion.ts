export const motionTokens = {
  duration: {
    fast: 0.16,
    normal: 0.24,
    slow: 0.32,
  },
  ease: {
    out: [0.23, 1, 0.32, 1],
    inOut: [0.77, 0, 0.175, 1],
  },
  stagger: {
    productPreview: 0.06,
  },
  spring: {
    interactive: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 1,
    },
  },
} as const;
