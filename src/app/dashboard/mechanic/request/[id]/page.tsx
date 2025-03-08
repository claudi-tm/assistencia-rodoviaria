import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import RequestActions from './request-actions';

export const metadata: Metadata = {
  title: 'Detalhes da Solicitação | Assistência Rodoviária',
  description: 'Visualize os detalhes da solicitação de assistência',
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

  const id = params.id;

  // Buscar detalhes da solicitação
  const request = await prisma.assistanceRequest.findUnique({
    where: {
      id,
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      mechanic: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!request) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow">
        <p className="text-red-500">Solicitação não encontrada.</p>
        <Link
          href="/dashboard/mechanic"
          className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  // Verificar se o mecânico pode ver esta solicitação
  const canViewRequest =
    request.status === 'PENDING' ||
    request.mechanicId === session.user.id;

  if (!canViewRequest) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow">
        <p className="text-red-500">Você não tem permissão para visualizar esta solicitação.</p>
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
        <h1 className="text-2xl font-bold">Detalhes da Solicitação</h1>
        <Link
          href="/dashboard/mechanic"
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{request.problemType}</h2>
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
            <p className="mt-1 text-lg">
              {request.driver.name} ({request.driver.email})
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Mecânico Atribuído</p>
            <p className="mt-1 text-lg">
              {request.mechanic
                ? `${request.mechanic.name} (${request.mechanic.email})`
                : 'Nenhum mecânico atribuído'}
            </p>
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

      <RequestActions
        requestId={request.id}
        currentStatus={request.status}
        mechanicId={request.mechanicId}
      />
    </div>
  );
} 