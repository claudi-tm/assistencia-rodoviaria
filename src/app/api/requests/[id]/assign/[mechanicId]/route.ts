import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; mechanicId: string } }
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
    const { id, mechanicId } = params;

    // Verificar se a solicitação existe e está pendente
    const assistanceRequest = await prisma.assistanceRequest.findUnique({
      where: {
        id,
        status: 'PENDING',
      },
    });

    if (!assistanceRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada ou não está pendente' },
        { status: 404 }
      );
    }

    // Verificar se o mecânico existe e está disponível
    const mechanic = await prisma.user.findUnique({
      where: {
        id: mechanicId,
        role: 'MECHANIC',
        status: 'AVAILABLE',
      },
    });

    if (!mechanic) {
      return NextResponse.json(
        { error: 'Mecânico não encontrado ou não está disponível' },
        { status: 404 }
      );
    }

    // Iniciar uma transação para garantir que ambas as operações sejam concluídas com sucesso
    await prisma.$transaction([
      // Atualizar a solicitação
      prisma.assistanceRequest.update({
        where: {
          id,
        },
        data: {
          status: 'ASSIGNED',
          mechanicId,
        },
      }),
      // Atualizar o status do mecânico para ocupado
      prisma.user.update({
        where: {
          id: mechanicId,
        },
        data: {
          status: 'BUSY',
        },
      }),
    ]);

    // Redirecionar de volta para a página de solicitações
    return NextResponse.redirect(new URL('/dashboard/manager/requests', request.url));
  } catch (error) {
    console.error('Erro ao atribuir solicitação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 