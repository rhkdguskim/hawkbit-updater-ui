export const NEOBRUTALISM = {
  borders: {
    thick: '3px solid var(--neo-border)',
    medium: '2px solid var(--neo-border)',
    thin: '1px solid var(--neo-border)',
  },
  
  shadows: {
    hard: '4px 4px 0px var(--neo-shadow)',
    hardLg: '6px 6px 0px var(--neo-shadow)',
    hardXl: '8px 8px 0px var(--neo-shadow)',
    hardHover: '2px 2px 0px var(--neo-shadow)',
    hardActive: '0px 0px 0px var(--neo-shadow)',
    colored: (color: string) => `4px 4px 0px ${color}`,
  },
  
  colors: {
    light: {
      border: '#000000',
      shadow: '#000000',
      bg: {
        primary: '#FFFFFF',
        secondary: '#F3F4F6',
        accent: '#FFE500',
        success: '#00FF88',
        warning: '#FF6B00',
        error: '#FF0055',
        info: '#0099FF',
      },
      text: {
        primary: '#000000',
        secondary: '#4B5563',
        inverse: '#FFFFFF',
      },
    },
    dark: {
      border: '#FFFFFF',
      shadow: 'rgba(255, 255, 255, 0.3)',
      bg: {
        primary: '#0A0A0A',
        secondary: '#1A1A1A',
        accent: '#FFE500',
        success: '#00FF88',
        warning: '#FF6B00',
        error: '#FF0055',
        info: '#0099FF',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#A0A0A0',
        inverse: '#000000',
      },
    },
  },
  
  transitions: {
    shadow: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
} as const;

export type NeoBrutalismTheme = typeof NEOBRUTALISM;
