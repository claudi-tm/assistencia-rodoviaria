import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Solicitações Pendentes | Assistência Rodoviária',
  description: 'Visualize as solicitações pendentes de assistência rodoviária',
};

export default async function MechanicPendingRequestsPage() {
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

  // Buscar todas as solicitações pendentes
  const pendingRequests = await prisma.assistanceRequest.findMany({
    where: {
      status: 'PENDING',
      mechanicId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      driver: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Solicitações Pendentes</h1>
        <Link
          href="/dashboard/mechanic"
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Voltar ao Dashboard
        </Link>
      </div>

      {pendingRequests.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <li key={request.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {request.problemType}
                    </p>
                    <div className="flex flex-shrink-0 ml-2">
                      <span className="inline-flex px-2 text-xs font-semibold leading-5 text-yellow-800 bg-yellow-100 rounded-full">
                        Pendente
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
                      <span className="font-medium">Condutor:</span> {request.driver.name} ({request.driver.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Localização:</span> {request.location}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/dashboard/mechanic/request/${request.id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Não há solicitações pendentes no momento.</p>
          <Link
            href="/dashboard/mechanic"
            className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      )}
    </div>
  );
} 