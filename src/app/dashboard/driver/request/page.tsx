import AssistanceRequestForm from '@/components/forms/AssistanceRequestForm';
import { authOptions } from '@/lib/auth/auth-options';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Solicitar Assistência | Assistência Rodoviária',
  description: 'Solicite assistência rodoviária para o seu veículo',
};

export default async function RequestAssistancePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'DRIVER') {
    if (session.user.role === 'MECHANIC') {
      redirect('/dashboard/mechanic');
    } else if (session.user.role === 'MANAGER') {
      redirect('/dashboard/manager');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <AssistanceRequestForm />
    </div>
  );
} 