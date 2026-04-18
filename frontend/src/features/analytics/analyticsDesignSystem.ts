/**
 * Analytics area — shared tokens, chart styling, and MUI theme factory.
 */
import { alpha, createTheme } from '@mui/material/styles';

export const ax = {
  bg: {
    root: '#050810',
    elevated: '#0c111d',
    card: '#111827',
    cardHover: '#151f32',
    sidebar: '#080c16',
    subtle: 'rgba(15, 23, 42, 0.65)',
  },
  border: {
    subtle: 'rgba(148, 163, 184, 0.12)',
    strong: 'rgba(148, 163, 184, 0.2)',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
  },
  accent: {
    cyan: '#22d3ee',
    violet: '#a78bfa',
    amber: '#fbbf24',
    rose: '#fb7185',
    emerald: '#34d399',
    lime: '#a3e635',
  },
  chart: {
    grid: 'rgba(148, 163, 184, 0.08)',
    axis: '#64748b',
    visitors: '#22d3ee',
    registrations: '#a78bfa',
    completions: '#fbbf24',
    revenueStroke: '#34d399',
    revenueFill: '#34d399',
    errors: '#f87171',
    product: '#4ade80',
    tier: '#818cf8',
  },
  gradients: {
    brand: 'linear-gradient(135deg, #22d3ee 0%, #4ade80 50%, #a3e635 100%)',
    cardShine:
      'linear-gradient(145deg, rgba(34, 211, 238, 0.06) 0%, rgba(15, 23, 42, 0.4) 40%, rgba(167, 139, 250, 0.05) 100%)',
    mesh: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.15), transparent 55%)',
  },
};

export const chartTooltipSx = {
  backgroundColor: `${ax.bg.elevated}f5`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${ax.border.strong}`,
  borderRadius: 12,
  boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
  padding: '10px 14px',
};

export const chartAxisTick = { fill: ax.text.muted, fontSize: 11, fontWeight: 500 };

export function createAnalyticsTheme() {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#34d399', light: '#6ee7b7', dark: '#059669' },
      secondary: { main: '#a78bfa' },
      error: { main: '#f87171' },
      warning: { main: '#fbbf24' },
      background: { default: ax.bg.root, paper: ax.bg.card },
      text: { primary: ax.text.primary, secondary: ax.text.secondary, disabled: ax.text.muted },
      divider: ax.border.subtle,
    },
    typography: {
      fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
      h3: { fontFamily: 'var(--font-display), "DM Sans", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
      h4: { fontFamily: 'var(--font-display), "DM Sans", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
      h5: { fontFamily: 'var(--font-display), "DM Sans", sans-serif', fontWeight: 700 },
      h6: { fontFamily: 'var(--font-display), "DM Sans", sans-serif', fontWeight: 700 },
      subtitle2: { fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: `${alpha('#94a3b8', 0.35)} transparent`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderColor: ax.border.subtle,
            color: ax.text.secondary,
            '&.Mui-selected': {
              color: ax.text.primary,
              backgroundColor: alpha('#34d399', 0.15),
              borderColor: alpha('#34d399', 0.35),
              '&:hover': { backgroundColor: alpha('#34d399', 0.22) },
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: alpha(ax.bg.elevated, 0.8),
              '& fieldset': { borderColor: ax.border.subtle },
              '&:hover fieldset': { borderColor: ax.border.strong },
              '&.Mui-focused fieldset': { borderColor: alpha('#34d399', 0.55) },
            },
            '& .MuiInputLabel-root': { color: ax.text.muted },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 14, alignItems: 'center' },
          standardWarning: {
            backgroundColor: alpha('#fbbf24', 0.1),
            border: `1px solid ${alpha('#fbbf24', 0.25)}`,
            color: ax.text.primary,
          },
          standardError: {
            backgroundColor: alpha('#f87171', 0.1),
            border: `1px solid ${alpha('#f87171', 0.25)}`,
            color: ax.text.primary,
          },
        },
      },
    },
  });
}
