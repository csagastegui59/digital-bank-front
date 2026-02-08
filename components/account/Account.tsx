import { COLORS } from "@/constants/colors";
import { Account as AccountType } from "@/services/account/account-service";
import { Box, Card, Grid, Typography } from "@mui/material";

export default function Account({ accounts }: { accounts: AccountType[] }) {
    return (
        <Grid container spacing={3}>
            {accounts.map((account) => (
                <Grid key={account.id} component={'div'}>
                    <Card
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            p: 3,
                            border: `1px solid ${COLORS.border.card}`,
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                    Número de Cuenta
                                </Typography>
                                <Typography sx={{ color: COLORS.text.light, fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>
                                    {account.accountNumber}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 4 }}>
                                <Box>
                                    <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                        Tipo
                                    </Typography>
                                    <Typography sx={{ color: COLORS.text.light, fontSize: '0.875rem', fontWeight: 500 }}>
                                        {account.type}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                        Moneda
                                    </Typography>
                                    <Typography sx={{ color: COLORS.text.light, fontSize: '0.875rem', fontWeight: 500 }}>
                                        {account.currency}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box>
                                <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                    Saldo
                                </Typography>
                                <Typography sx={{ color: COLORS.state.success, fontSize: '1.5rem', fontWeight: 700 }}>
                                    {account.currency === 'USD' ? '$' : 'S/.'} {parseFloat(account.balance).toFixed(2)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography sx={{ color: account.isActive ? COLORS.state.success : COLORS.state.error, fontSize: '0.875rem', fontWeight: 500 }}>
                                    {account.isActive ? '● Activa' : '● Inactiva'}
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}