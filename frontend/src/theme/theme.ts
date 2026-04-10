import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#16a34a',
    },
    secondary: {
      main: '#6366f1',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    h1: { fontFamily: 'var(--font-display), "DM Sans", sans-serif' },
    h2: { fontFamily: 'var(--font-display), "DM Sans", sans-serif' },
    h3: { fontFamily: 'var(--font-display), "DM Sans", sans-serif' },
    h4: { fontFamily: 'var(--font-display), "DM Sans", sans-serif' },
    h5: { fontFamily: 'var(--font-display), "DM Sans", sans-serif' },
    h6: { fontFamily: 'var(--font-display), "DM Sans", sans-serif' },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 },
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          padding: 10,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            '& input, & textarea': { fontSize: '16px' },
          },
        },
      },
    },
  },
});
