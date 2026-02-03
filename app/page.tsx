'use client';

import { ThemeProvider } from '@mui/material';
import { theme } from '@/theme/theme';
import { LoginForm } from '@/components/login';

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <LoginForm />
    </ThemeProvider>
  );
}

