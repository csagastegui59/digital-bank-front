import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

const API_URL = 'https://digital-bank-1-zcmv.onrender.com';

export default async function DashboardPage() {
  // Obtener cookies directamente
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userCookie = cookieStore.get('user')?.value;

  // Verificar autenticación
  if (!accessToken || !userCookie) {
    redirect('/');
  }

  // Parse user data
  let user;
  try {
    user = JSON.parse(userCookie);
  } catch {
    redirect('/');
  }

  // Obtener cuentas del usuario desde el servidor
  let accounts = [];
  try {
    const response = await fetch(`${API_URL}/accounts/user/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (response.ok) {
      accounts = await response.json();
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }

  return <DashboardClient user={user} accounts={accounts} />;
}
