import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminPanel from '@/components/admin/AdminPanel';

async function getUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  
  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const user = await getUser();

  if (!user) {
    redirect('/');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <AdminPanel user={user} />;
}
