export const COLORS = {
  primary: {
    main: '#4287f5',
    dark: '#01267d',
  },

  text: {
    dark: '#0d0d0d',
    light: '#f7fbfc',
  },

  background: {
    gradient: {
      start: '#01267d',
      end: '#4287f5',
    },
    card: 'rgba(255, 255, 255, 0.1)',
    input: 'rgba(255, 255, 255, 0.9)',
    decorative: 'rgba(247, 251, 252, 0.1)',
  },

  border: {
    default: 'rgba(255, 255, 255, 0.5)',
    focus: '#f7fbfc',
    card: 'rgba(255, 255, 255, 0.2)',
  },

  state: {
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },

  button: {
    primary: {
      background: '#f7fbfc',
      text: '#01267d',
      hover: '#e5f3fc',
    },
  },
} as const;

export type ColorPath = typeof COLORS;
