import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard do Condutor | Assistência Rodoviária',
  description: 'Dashboard do condutor no sistema de assistência rodoviária',
};

export default async function DriverDashboard() {
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

  // Buscar as solicitações do condutor
  const requests = await prisma.assistanceRequest.findMany({
    where: {
      driverId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  // Contar solicitações por status
  const pendingCount = await prisma.assistanceRequest.count({
    where: {
      driverId: session.user.id,
      status: 'PENDING',
    },
  });

  const inProgressCount = await prisma.assistanceRequest.count({
    where: {
      driverId: session.user.id,
      status: 'IN_PROGRESS',
    },
  });

  const completedCount = await prisma.assistanceRequest.count({
    where: {
      driverId: session.user.id,
      status: 'COMPLETED',
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard do Condutor</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Solicitações Pendentes</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{pendingCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Em Andamento</h2>
          <p className="mt-2 text-3xl font-bold text-yellow-500">{inProgressCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Concluídas</h2>
          <p className="mt-2 text-3xl font-bold text-green-500">{completedCount}</p>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Solicitações Recentes</h2>
          <Link href="/dashboard/driver/requests" className="text-indigo-600 hover:text-indigo-800">
            Ver todas
          </Link>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="p-3">Tipo de Problema</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t">
                    <td className="p-3">{request.problemType}</td>
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
                    <td className="p-3">
                      {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Você ainda não tem solicitações.</p>
        )}
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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