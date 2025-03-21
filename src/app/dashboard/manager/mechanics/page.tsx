import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Gerenciar Mecânicos | Assistência Rodoviária',
  description: 'Gerenciamento de mecânicos no sistema de assistência rodoviária',
};

export default async function ManageMechanicsPage() {
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

  // Buscar todos os mecânicos
  const mechanics = await prisma.user.findMany({
    where: {
      role: 'MECHANIC',
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Mecânicos</h1>
        <Link
          href="/dashboard/manager"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Lista de Mecânicos</h2>
          <Link
            href="/register?role=MECHANIC"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Adicionar Mecânico
          </Link>
        </div>

        {mechanics.length === 0 ? (
          <p className="p-4 text-center text-gray-500">Nenhum mecânico cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Data de Cadastro</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mechanics.map((mechanic) => (
                  <tr key={mechanic.id} className="border-t border-gray-200">
                    <td className="p-3">{mechanic.name}</td>
                    <td className="p-3">{mechanic.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${mechanic.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {mechanic.status === 'AVAILABLE' ? 'Disponível' : 'Ocupado'}
                      </span>
                    </td>
                    <td className="p-3">{new Date(mechanic.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/dashboard/manager/mechanics/${mechanic.id}`}
                          className="px-3 py-1 text-xs text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                        >
                          Detalhes
                        </Link>
                        <Link
                          href={`/api/mechanics/${mechanic.id}/toggle-status`}
                          className={`px-3 py-1 text-xs rounded-md ${mechanic.status === 'AVAILABLE'
                            ? 'text-red-600 bg-red-100 hover:bg-red-200'
                            : 'text-green-600 bg-green-100 hover:bg-green-200'
                            }`}
                        >
                          {mechanic.status === 'AVAILABLE' ? 'Marcar como Ocupado' : 'Marcar como Disponível'}
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