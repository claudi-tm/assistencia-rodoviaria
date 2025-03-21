import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário está autenticado e é um gerente
  if (!session || session.user.role !== 'MANAGER') {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    // Usar a sintaxe de desestruturação para acessar params em Next.js 15
    const { id } = params;

    // Buscar o mecânico
    const mechanic = await prisma.user.findUnique({
      where: {
        id,
        role: 'MECHANIC',
      },
    });

    if (!mechanic) {
      return NextResponse.json(
        { error: 'Mecânico não encontrado' },
        { status: 404 }
      );
    }

    // Alternar o status
    const newStatus = mechanic.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';

    // Atualizar o mecânico
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        status: newStatus,
      },
    });

    // Redirecionar de volta para a página de mecânicos
    return NextResponse.redirect(new URL('/dashboard/manager/mechanics', request.url));
  } catch (error) {
    console.error('Erro ao alternar status do mecânico:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 