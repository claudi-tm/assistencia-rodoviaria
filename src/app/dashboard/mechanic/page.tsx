import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard do Mecânico | Assistência Rodoviária',
  description: 'Dashboard do mecânico no sistema de assistência rodoviária',
};

export default async function MechanicDashboard() {
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

  // Buscar as solicitações pendentes
  const pendingRequests = await prisma.assistanceRequest.findMany({
    where: {
      status: 'PENDING',
      mechanicId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    include: {
      driver: {
        select: {
          name: true,
        },
      },
    },
  });

  // Buscar as solicitações atribuídas ao mecânico
  const assignedRequests = await prisma.assistanceRequest.findMany({
    where: {
      mechanicId: session.user.id,
      status: {
        in: ['ASSIGNED', 'IN_PROGRESS'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    include: {
      driver: {
        select: {
          name: true,
        },
      },
    },
  });

  // Contar solicitações por status
  const pendingCount = await prisma.assistanceRequest.count({
    where: {
      status: 'PENDING',
      mechanicId: null,
    },
  });

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard do Mecânico</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Pendentes</h2>
          <p className="mt-2 text-3xl font-bold text-yellow-500">{pendingCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Atribuídas</h2>
          <p className="mt-2 text-3xl font-bold text-blue-500">{assignedCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Em Andamento</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{inProgressCount}</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Concluídas</h2>
          <p className="mt-2 text-3xl font-bold text-green-500">{completedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Solicitações Pendentes</h2>
            <Link href="/dashboard/mechanic/pending" className="text-indigo-600 hover:text-indigo-800">
              Ver todas
            </Link>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="p-3">Tipo de Problema</th>
                    <th className="p-3">Condutor</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-t">
                      <td className="p-3">{request.problemType}</td>
                      <td className="p-3">{request.driver.name}</td>
                      <td className="p-3">
                        {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/dashboard/mechanic/request/${request.id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Não há solicitações pendentes no momento.</p>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Minhas Atribuições</h2>
            <Link href="/dashboard/mechanic/assigned" className="text-indigo-600 hover:text-indigo-800">
              Ver todas
            </Link>
          </div>

          {assignedRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="p-3">Tipo de Problema</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Condutor</th>
                    <th className="p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedRequests.map((request) => (
                    <tr key={request.id} className="border-t">
                      <td className="p-3">{request.problemType}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                            }`}
                        >
                          {request.status === 'ASSIGNED' ? 'Atribuído' : 'Em Andamento'}
                        </span>
                      </td>
                      <td className="p-3">{request.driver.name}</td>
                      <td className="p-3">
                        <Link
                          href={`/dashboard/mechanic/request/${request.id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Você não tem solicitações atribuídas no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
} 