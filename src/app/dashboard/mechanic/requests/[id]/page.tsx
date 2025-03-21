import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Detalhes da Solicitação | Assistência Rodoviária',
  description: 'Detalhes da solicitação de assistência rodoviária',
};

export default async function MechanicRequestDetailsPage({
  params,
}: {
  params: { id: string };
}) {
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

  const { id } = params;

  // Buscar detalhes da solicitação
  const request = await prisma.assistanceRequest.findUnique({
    where: {
      id,
      mechanicId: session.user.id, // Garantir que o mecânico só veja suas próprias solicitações
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!request) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow">
        <p className="text-red-500">Solicitação não encontrada ou você não tem permissão para visualizá-la.</p>
        <Link
          href="/dashboard/mechanic"
          className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Voltar para o Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalhes da Solicitação</h1>
        <Link
          href="/dashboard/mechanic"
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Voltar para o Dashboard
        </Link>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{request.problemType}</h2>
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
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Descrição</p>
            <p className="mt-1 text-lg">{request.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Localização</p>
            <p className="mt-1 text-lg">{request.location}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Condutor</p>
            <div className="mt-1">
              <p className="text-lg">{request.driver.name}</p>
              <p className="text-sm text-gray-600">Email: {request.driver.email}</p>
              {request.driver.phone && (
                <p className="text-sm text-gray-600">Telefone: {request.driver.phone}</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Data da Solicitação</p>
            <p className="mt-1 text-lg">
              {new Date(request.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Última Atualização</p>
            <p className="mt-1 text-lg">
              {new Date(request.updatedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Ações</h2>

        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
          {(request.status === 'ASSIGNED' || request.status === 'IN_PROGRESS') && (
            <>
              {request.status === 'ASSIGNED' && (
                <Link
                  href={`/api/requests/${request.id}/start`}
                  className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Iniciar Atendimento
                </Link>
              )}

              <Link
                href={`/api/requests/${request.id}/complete`}
                className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Marcar como Concluída
              </Link>

              <Link
                href={`/api/requests/${request.id}/cancel`}
                className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Cancelar Solicitação
              </Link>
            </>
          )}

          {(request.status === 'COMPLETED' || request.status === 'CANCELLED') && (
            <p className="p-3 text-sm text-gray-500 bg-gray-100 rounded-md">
              Esta solicitação já foi {request.status === 'COMPLETED' ? 'concluída' : 'cancelada'} e não pode ser modificada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
