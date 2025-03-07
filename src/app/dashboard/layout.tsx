import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { authOptions } from '@/lib/auth/auth-options';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard | Assistência Rodoviária',
  description: 'Dashboard do sistema de assistência rodoviária',
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
} 