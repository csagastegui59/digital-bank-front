'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Box,
  Card,
  Button,
  CircularProgress,
  Container,
  OutlinedInput,
  InputLabel,
  Link,
  Tooltip,
  Alert,
  Typography,
} from '@mui/material';
import { COLORS } from '@/constants/colors';
import { authService, ApiError } from '@/services/api';
import { authStorage } from '@/utils/auth';

export default function LoginForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [canSignup, setCanSignup] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Consultar estado de signup al cambiar de modo
  useEffect(() => {
    if (!isLogin) {
      checkSignupStatus();
    }
  }, [isLogin]);

  // Contador regresivo
  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            checkSignupStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [remainingSeconds]);

  const checkSignupStatus = async () => {
    try {
      const status = await authService.getSignupStatus();
      setCanSignup(status.canSignup);
      setRemainingSeconds(status.remainingSeconds);
    } catch (error) {
      console.error('Error checking signup status:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor ingresa un email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await authService.login({ email, password });
        setTimeout(() => {
          toast.success('¡Inicio de sesión exitoso!');
        }, 500);
      } else {
        response = await authService.signup({ email, password, role: 'CUSTOMER' });
        toast.success('¡Cuenta creada exitosamente!');
      }
      authStorage.saveAuth(response);

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
      console.error('Error de autenticación:', error);
    } finally {

      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${COLORS.background.gradient.start} 0%, ${COLORS.background.gradient.end} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="sm" sx={{ px: 3 }}>
        <Card
          elevation={24}
          sx={{
            backgroundColor: COLORS.background.card,
            backdropFilter: 'blur(20px)',
            borderRadius: 6,
            p: 4,
            border: `1px solid ${COLORS.border.card}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Image
              src="/logo_big.png"
              alt="Digital Bank Logo"
              width={200}
              height={80}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Rate Limit Alert */}
            {!isLogin && !canSignup && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⏱️ Límite de registros alcanzado
                </Typography>
                <Typography variant="body2">
                  Para prevenir ataques automatizados, solo se permite un registro cada 15 minutos.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                  Tiempo restante: {formatTime(remainingSeconds)}
                </Typography>
              </Alert>
            )}

            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <InputLabel htmlFor="email" sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Email</InputLabel>
              <OutlinedInput
                fullWidth
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => validateEmail(email)}
                error={!!emailError}
                sx={{
                  color: COLORS.text.dark,
                  backgroundColor: COLORS.background.input,
                  borderColor: emailError ? COLORS.state.error : COLORS.text.light,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: emailError ? COLORS.state.error : COLORS.border.default,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: emailError ? COLORS.state.error : COLORS.text.light,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: emailError ? COLORS.state.error : COLORS.text.light,
                  },
                }}
              />
              {emailError && (
                <Box sx={{ color: COLORS.state.error, fontSize: '0.875rem', mt: 0.5 }}>
                  {emailError}
                </Box>
              )}
            </Box>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <InputLabel htmlFor="password" sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Password</InputLabel>
              <OutlinedInput
                fullWidth
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => validatePassword(password)}
                error={!!passwordError}
                sx={{
                  color: COLORS.text.dark,
                  backgroundColor: COLORS.background.input,
                  borderColor: passwordError ? COLORS.state.error : COLORS.text.light,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: passwordError ? COLORS.state.error : COLORS.border.default,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: passwordError ? COLORS.state.error : COLORS.text.light,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: passwordError ? COLORS.state.error : COLORS.text.light,
                  },
                }}
              />
              {passwordError && (
                <Box sx={{ color: COLORS.state.error, fontSize: '0.875rem', mt: 0.5 }}>
                  {passwordError}
                </Box>
              )}
            </Box>
            <Tooltip 
              title={!isLogin && !canSignup ? `Espera ${formatTime(remainingSeconds)} para registrar un nuevo usuario` : ''}
              arrow
              placement="top"
            >
              <span style={{ width: '100%' }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading || (!isLogin && !canSignup)}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: COLORS.button.primary.background,
                    color: COLORS.button.primary.text,
                    boxShadow: 4,
                    '&:hover': {
                      backgroundColor: COLORS.button.primary.hover,
                      transform: 'scale(1.02)',
                      boxShadow: 6,
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    '&:disabled': {
                      backgroundColor: COLORS.text.light,
                      opacity: 0.5,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: COLORS.button.primary.text }} />
                  ) : (
                    isLogin ? 'Iniciar Sesión' : canSignup ? 'Registrarse' : `Espera ${formatTime(remainingSeconds)}`
                  )}
                </Button>
              </span>
            </Tooltip>
          </Box>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component="button"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              sx={{
                color: COLORS.text.light,
                fontSize: '0.875rem',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </Link>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
