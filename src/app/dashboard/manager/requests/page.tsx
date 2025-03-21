import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Todas as Solicitações | Assistência Rodoviária',
  description: 'Visualização de todas as solicitações no sistema de assistência rodoviária',
};

export default async function AllRequestsPage() {
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

  // Buscar todas as solicitações
  const requests = await prisma.assistanceRequest.findMany({
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
          id: true,
          status: true,
        },
      },
    },
  });

  // Buscar todos os mecânicos disponíveis para atribuição
  const availableMechanics = await prisma.user.findMany({
    where: {
      role: 'MECHANIC',
      status: 'AVAILABLE',
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todas as Solicitações</h1>
        <Link
          href="/dashboard/manager"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        {requests.length === 0 ? (
          <p className="p-4 text-center text-gray-500">Nenhuma solicitação encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Condutor</th>
                  <th className="p-3 text-left">Problema</th>
                  <th className="p-3 text-left">Localização</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Mecânico</th>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-gray-200">
                    <td className="p-3">{request.id.substring(0, 8)}...</td>
                    <td className="p-3">{request.driver.name}</td>
                    <td className="p-3">{request.problemType}</td>
                    <td className="p-3">{request.location}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === 'PENDING'
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
                      {request.mechanic ? (
                        <div className="flex items-center space-x-1">
                          <span>{request.mechanic.name}</span>
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${request.mechanic.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                          ></span>
                        </div>
                      ) : (
                        'Não atribuído'
                      )}
                    </td>
                    <td className="p-3">{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {request.status === 'PENDING' && (
                          <div className="flex flex-col items-start space-y-2">
                            <span className="text-xs font-medium text-gray-700 mb-1">
                              {availableMechanics.length > 0 ? 'Atribuir a:' : 'Não há mecânicos disponíveis'}
                            </span>

                            {availableMechanics.length > 0 ? (
                              <form action={`/api/requests/${request.id}/assign`} method="post" className="w-full">
                                <div className="flex space-x-1">
                                  <select
                                    name="mechanicId"
                                    className="text-xs px-2 py-1 border border-gray-300 rounded-md"
                                    required
                                  >
                                    <option value="">Selecione</option>
                                    {availableMechanics.map((mechanic) => (
                                      <option key={mechanic.id} value={mechanic.id}>
                                        {mechanic.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="submit"
                                    className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                  >
                                    Atribuir
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <span className="text-xs text-red-500">
                                Todos mecânicos ocupados
                              </span>
                            )}
                          </div>
                        )}

                        {(request.status === 'ASSIGNED' || request.status === 'IN_PROGRESS') && (
                          <Link
                            href={`/api/requests/${request.id}/complete`}
                            className="px-3 py-1 text-xs text-green-600 bg-green-100 rounded-md hover:bg-green-200"
                          >
                            Concluir
                          </Link>
                        )}

                        <Link
                          href={`/dashboard/manager/requests/${request.id}`}
                          className="px-3 py-1 text-xs text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 