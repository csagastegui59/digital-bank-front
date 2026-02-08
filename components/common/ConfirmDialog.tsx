'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { COLORS } from '@/constants/colors';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: COLORS.background.card, color: COLORS.text.dark }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: COLORS.background.card, pt: 3 }}>
        <Typography sx={{ color: COLORS.text.dark }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: COLORS.background.card, p: 3 }}>
        <Button onClick={onCancel} sx={{ backgroundColor: COLORS.state.error, color: COLORS.text.light }}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            backgroundColor: COLORS.state.success,
            color: COLORS.text.light,
            '&:hover': {
              backgroundColor: COLORS.state.successHover,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
