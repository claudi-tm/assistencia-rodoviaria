import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Meu Perfil | Assistência Rodoviária',
  description: 'Visualize e edite seu perfil de mecânico',
};

export default async function MechanicProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'MECHANIC') {
    if (session.user.role === 'DRIVER') {
      redirect('/dashboard/driver');
    } else if (session.user.role === 'MANAGER') {
      redirect('/dashboard/manager');
    }
  }

  // Buscar informações do mecânico
  const mechanic = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  // Buscar estatísticas
  const assignedCount = await prisma.assistanceRequest.count({
    where: {
      mechanicId: session.user.id,
      status: 'ASSIGNED',
    },
  });

  const inProgressCount = await prisma.assistanceRequest.count({
    where: {
      mechanicId: session.user.id,
      status: 'IN_PROGRESS',
    },
  });

  const completedCount = await prisma.assistanceRequest.count({
    where: {
      mechanicId: session.user.id,
      status: 'COMPLETED',
    },
  });

  if (!mechanic) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow">
        <p className="text-red-500">Erro ao carregar informações do perfil.</p>
        <Link
          href="/dashboard/mechanic"
          className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <Link
          href="/dashboard/mechanic"
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Informações Pessoais</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nome</p>
              <p className="text-lg">{mechanic.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{mechanic.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Função</p>
              <p className="text-lg">Mecânico</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Membro desde</p>
              <p className="text-lg">
                {new Date(mechanic.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Estatísticas</h2>
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">
            <div className="p-4 text-center bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-medium">Atribuídas</h3>
              <p className="mt-2 text-2xl font-bold text-blue-600">{assignedCount}</p>
            </div>
            <div className="p-4 text-center bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-medium">Em Andamento</h3>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{inProgressCount}</p>
            </div>
            <div className="p-4 text-center bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-medium">Concluídas</h3>
              <p className="mt-2 text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-medium">Total de Atendimentos</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {assignedCount + inProgressCount + completedCount}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold">Ações</h2>
        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
          <Link
            href="/dashboard/mechanic/pending"
            className="flex items-center justify-center p-4 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Ver Solicitações Pendentes
          </Link>
          <Link
            href="/dashboard/mechanic/assigned"
            className="flex items-center justify-center p-4 font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200"
          >
            Ver Minhas Atribuições
          </Link>
        </div>
      </div>
    </div>
  );
} 