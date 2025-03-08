import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard do Gerente | Assistência Rodoviária',
  description: 'Dashboard do gerente no sistema de assistência rodoviária',
};

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'MANAGER') {
    if (session.user.role === 'DRIVER') {
      redirect('/dashboard/driver');
    } else if (session.user.role === 'MECHANIC') {
      redirect('/dashboard/mechanic');
    }
  }

  // Buscar estatísticas
  const pendingCount = await prisma.assistanceRequest.count({
    where: {
      status: 'PENDING',
    },
  });

  const assignedCount = await prisma.assistanceRequest.count({
    where: {
      status: 'ASSIGNED',
    },
  });

  const inProgressCount = await prisma.assistanceRequest.count({
    where: {
      status: 'IN_PROGRESS',
    },
  });

  const completedCount = await prisma.assistanceRequest.count({
    where: {
      status: 'COMPLETED',
    },
  });

  // Buscar mecânicos
  const mechanics = await prisma.user.count({
    where: {
      role: 'MECHANIC',
    },
  });

  // Buscar condutores
  const drivers = await prisma.user.count({
    where: {
      role: 'DRIVER',
    },
  });

  // Buscar solicitações recentes
  const recentRequests = await prisma.assistanceRequest.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      driver: {
        select: {
          name: true,
        },
      },
      mechanic: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard do Gerente</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Solicitações Pendentes</h2>
          <p className="mt-2 text-3xl font-bold text-yellow-500">{pendingCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Em Andamento</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{assignedCount + inProgressCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Concluídas</h2>
          <p className="mt-2 text-3xl font-bold text-green-500">{completedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Equipe</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 text-center bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-medium">Mecânicos</h3>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{mechanics}</p>
            </div>
            <div className="p-4 text-center bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-medium">Condutores</h3>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{drivers}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Link
              href="/dashboard/manager/mechanics"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Gerenciar Mecânicos
            </Link>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Ações Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <Link
              href="/dashboard/manager/requests"
              className="flex items-center justify-center p-4 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Ver Todas as Solicitações
            </Link>
            <Link
              href="/dashboard/manager/reports"
              className="flex items-center justify-center p-4 font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200"
            >
              Gerar Relatórios
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Solicitações Recentes</h2>
          <Link href="/dashboard/manager/requests" className="text-indigo-600 hover:text-indigo-800">
            Ver todas
          </Link>
        </div>

        {recentRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="p-3">Tipo de Problema</th>
                  <th className="p-3">Condutor</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Mecânico</th>
                  <th className="p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr key={request.id} className="border-t">
                    <td className="p-3">{request.problemType}</td>
                    <td className="p-3">{request.driver.name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-800'
                            : request.status === 'IN_PROGRESS'
                              ? 'bg-indigo-100 text-indigo-800'
                              : request.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {request.status === 'PENDING'
                          ? 'Pendente'
                          : request.status === 'ASSIGNED'
                            ? 'Atribuído'
                            : request.status === 'IN_PROGRESS'
                              ? 'Em Andamento'
                              : request.status === 'COMPLETED'
                                ? 'Concluído'
                                : 'Cancelado'}
                      </span>
                    </td>
                    <td className="p-3">{request.mechanic?.name || '-'}</td>
                    <td className="p-3">
                      {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Não há solicitações recentes.</p>
        )}
      </div>
    </div>
  );
} 