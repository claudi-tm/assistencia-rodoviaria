import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Meu Perfil | Assistência Rodoviária',
  description: 'Visualize e edite seu perfil de condutor',
};

export default async function DriverProfilePage() {
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

  // Buscar informações do condutor
  const driver = await prisma.user.findUnique({
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
  const pendingCount = await prisma.assistanceRequest.count({
    where: {
      driverId: session.user.id,
      status: 'PENDING',
    },
  });

  const inProgressCount = await prisma.assistanceRequest.count({
    where: {
      driverId: session.user.id,
      status: {
        in: ['ASSIGNED', 'IN_PROGRESS'],
      },
    },
  });

  const completedCount = await prisma.assistanceRequest.count({
    where: {
      driverId: session.user.id,
      status: 'COMPLETED',
    },
  });

  const totalRequests = await prisma.assistanceRequest.count({
    where: {
      driverId: session.user.id,
    },
  });

  if (!driver) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow">
        <p className="text-red-500">Erro ao carregar informações do perfil.</p>
        <Link
          href="/dashboard/driver"
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
          href="/dashboard/driver"
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
              <p className="text-lg">{driver.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{driver.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Função</p>
              <p className="text-lg">Condutor</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Membro desde</p>
              <p className="text-lg">
                {new Date(driver.createdAt).toLocaleDateString('pt-BR', {
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
              <h3 className="text-lg font-medium">Pendentes</h3>
              <p className="mt-2 text-2xl font-bold text-yellow-600">{pendingCount}</p>
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
            <h3 className="text-lg font-medium">Total de Solicitações</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {totalRequests}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold">Ações</h2>
        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
          <Link
            href="/dashboard/driver/request"
            className="flex items-center justify-center p-4 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Solicitar Assistência
          </Link>
          <Link
            href="/dashboard/driver/requests"
            className="flex items-center justify-center p-4 font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200"
          >
            Ver Minhas Solicitações
          </Link>
        </div>
      </div>
    </div>
  );
} 