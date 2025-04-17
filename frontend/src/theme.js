import { createTheme } from '@mui/material/styles';

const spotifyGreen = '#1DB954';
const darkBg = '#191414';
const darkSidebar = '#121212';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: spotifyGreen,
      contrastText: '#fff',
    },
    background: {
      default: darkBg,
      paper: darkSidebar,
    },
    text: {
      primary: '#fff',
      secondary: '#b3b3b3',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h3: {
      fontWeight: 700,
      letterSpacing: '-1px',
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: darkSidebar,
        },
      },
    },
  },
});

export default theme;
