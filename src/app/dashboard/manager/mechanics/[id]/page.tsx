import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Detalhes do Mecânico | Assistência Rodoviária',
  description: 'Detalhes do mecânico no sistema de assistência rodoviária',
};

export default async function MechanicDetailsPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Usar a sintaxe correta para acessar params em Next.js 15
  const { id } = params;

  // Buscar detalhes do mecânico
  const mechanic = await prisma.user.findUnique({
    where: {
      id,
      role: 'MECHANIC',
    },
  });

  if (!mechanic) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow">
        <p className="text-red-500">Mecânico não encontrado.</p>
        <Link
          href="/dashboard/manager/mechanics"
          className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Voltar para Lista de Mecânicos
        </Link>
      </div>
    );
  }

  // Buscar solicitações atribuídas a este mecânico
  const assignedRequests = await prisma.assistanceRequest.findMany({
    where: {
      mechanicId: id,
      status: {
        in: ['ASSIGNED', 'IN_PROGRESS'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      driver: {
        select: {
          name: true,
        },
      },
    },
  });

  // Buscar histórico de solicitações concluídas
  const completedRequests = await prisma.assistanceRequest.findMany({
    where: {
      mechanicId: id,
      status: 'COMPLETED',
    },
    orderBy: {
      completedAt: 'desc',
    },
    take: 10,
    include: {
      driver: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalhes do Mecânico</h1>
        <Link
          href="/dashboard/manager/mechanics"
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Voltar para Lista de Mecânicos
        </Link>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{mechanic.name}</h2>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${mechanic.status === 'AVAILABLE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}
          >
            {mechanic.status === 'AVAILABLE' ? 'Disponível' : 'Ocupado'}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-lg">{mechanic.email}</p>
          </div>

          {mechanic.phone && (
            <div>
              <p className="text-sm font-medium text-gray-500">Telefone</p>
              <p className="mt-1 text-lg">{mechanic.phone}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
            <p className="mt-1 text-lg">
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
        <h2 className="text-xl font-semibold mb-4">Solicitações Atuais</h2>

        {assignedRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="p-3">Tipo de Problema</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Condutor</th>
                  <th className="p-3">Data</th>
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
                    <td className="p-3">{new Date(request.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3">
                      <Link
                        href={`/dashboard/manager/requests/${request.id}`}
                        className="px-3 py-1 text-xs text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Este mecânico não tem solicitações atribuídas no momento.</p>
        )}
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Histórico de Solicitações</h2>

        {completedRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="p-3">Tipo de Problema</th>
                  <th className="p-3">Condutor</th>
                  <th className="p-3">Data de Conclusão</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {completedRequests.map((request) => (
                  <tr key={request.id} className="border-t">
                    <td className="p-3">{request.problemType}</td>
                    <td className="p-3">{request.driver.name}</td>
                    <td className="p-3">
                      {request.completedAt
                        ? new Date(request.completedAt).toLocaleDateString('pt-BR')
                        : new Date(request.updatedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/dashboard/manager/requests/${request.id}`}
                        className="px-3 py-1 text-xs text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Este mecânico não tem solicitações concluídas.</p>
        )}
      </div>
    </div>
  );
} 