import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Relatórios | Assistência Rodoviária',
  description: 'Geração de relatórios no sistema de assistência rodoviária',
};

export default async function ReportsPage() {
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

  // Estatísticas por status
  const statusStats = await prisma.assistanceRequest.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  // Estatísticas por tipo de problema
  const problemTypeStats = await prisma.assistanceRequest.groupBy({
    by: ['problemType'],
    _count: {
      problemType: true,
    },
  });

  // Estatísticas por mecânico
  const mechanicStats = await prisma.assistanceRequest.groupBy({
    by: ['mechanicId'],
    _count: {
      mechanicId: true,
    },
    where: {
      mechanicId: {
        not: null,
      },
    },
  });

  // Buscar nomes dos mecânicos
  const mechanics = await prisma.user.findMany({
    where: {
      role: 'MECHANIC',
    },
    select: {
      id: true,
      name: true,
    },
  });

  const mechanicNames = mechanics.reduce((acc, mechanic) => {
    acc[mechanic.id] = mechanic.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Link
          href="/dashboard/manager"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Solicitações por Status</h2>
          <div className="space-y-4">
            {statusStats.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between">
                <span className="font-medium">
                  {stat.status === 'PENDING'
                    ? 'Pendente'
                    : stat.status === 'ASSIGNED'
                      ? 'Atribuído'
                      : stat.status === 'IN_PROGRESS'
                        ? 'Em Andamento'
                        : stat.status === 'COMPLETED'
                          ? 'Concluído'
                          : 'Cancelado'}
                </span>
                <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                  {stat._count.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Solicitações por Tipo de Problema</h2>
          <div className="space-y-4">
            {problemTypeStats.map((stat) => (
              <div key={stat.problemType} className="flex items-center justify-between">
                <span className="font-medium">{stat.problemType}</span>
                <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                  {stat._count.problemType}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Solicitações por Mecânico</h2>
        {mechanicStats.length === 0 ? (
          <p className="text-gray-500">Nenhuma solicitação atribuída a mecânicos.</p>
        ) : (
          <div className="space-y-4">
            {mechanicStats.map((stat) => (
              <div key={stat.mechanicId} className="flex items-center justify-between">
                <span className="font-medium">
                  {mechanicNames[stat.mechanicId as string] || 'Mecânico Desconhecido'}
                </span>
                <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                  {stat._count.mechanicId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 