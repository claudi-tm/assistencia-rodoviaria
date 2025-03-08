import { authOptions } from '@/lib/auth/auth-options';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Redirecionar para o dashboard apropriado com base na função do usuário
  if (session.user.role === 'DRIVER') {
    redirect('/dashboard/driver');
  } else if (session.user.role === 'MECHANIC') {
    redirect('/dashboard/mechanic');
  } else if (session.user.role === 'MANAGER') {
    redirect('/dashboard/manager');
  } else {
    // Caso a função não seja reconhecida, redirecionar para a página inicial
    redirect('/');
  }

  // Esta parte nunca será executada devido aos redirecionamentos acima,
  // mas é necessária para satisfazer o TypeScript
  return null;
} 