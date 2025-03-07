import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Minhas Solicitações | Assistência Rodoviária',
  description: 'Visualize suas solicitações de assistência rodoviária',
};

export default async function DriverRequestsPage() {
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

  // Buscar todas as solicitações do condutor
  const requests = await prisma.assistanceRequest.findMany({
    where: {
      driverId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      mechanic: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas Solicitações</h1>
        <Link
          href="/dashboard/driver/request"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Nova Solicitação
        </Link>
      </div>

      {requests.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {request.problemType}
                    </p>
                    <div className="flex flex-shrink-0 ml-2">
                      <span
                        className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${request.status === 'PENDING'
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
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {request.description}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                      <p>
                        {new Date(request.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Localização:</span> {request.location}
                    </p>
                    {request.mechanicId && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Mecânico:</span> {request.mechanic?.name}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Você ainda não tem solicitações de assistência.</p>
          <Link
            href="/dashboard/driver/request"
            className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Solicitar Assistência
          </Link>
        </div>
      )}
    </div>
  );
} 