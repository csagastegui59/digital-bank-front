import { createTheme } from '@mui/material';
import { COLORS } from '@/constants/colors';

export const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.primary.main,
      dark: COLORS.primary.dark,
    },
    secondary: {
      main: COLORS.text.light,
    },
    text: {
      primary: COLORS.text.dark,
      secondary: COLORS.text.light,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: COLORS.background.input,
            borderRadius: '12px',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: COLORS.border.default,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.border.focus,
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: COLORS.text.light,
          },
        },
      },
    },
  },
});
