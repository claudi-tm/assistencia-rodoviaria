import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário está autenticado e tem permissão
  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'MECHANIC')) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    // Verificar se a solicitação existe
    const assistanceRequest = await prisma.assistanceRequest.findUnique({
      where: { id },
    });

    if (!assistanceRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a solicitação já está cancelada ou concluída
    if (assistanceRequest.status === 'CANCELLED' || assistanceRequest.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Esta solicitação já está cancelada ou concluída' },
        { status: 400 }
      );
    }

    // Verificar se a solicitação está atribuída a um mecânico
    if (!assistanceRequest.mechanicId) {
      return NextResponse.json(
        { error: 'Esta solicitação não está atribuída a um mecânico' },
        { status: 400 }
      );
    }

    // Se o usuário for um mecânico, verificar se a solicitação está atribuída a ele
    if (session.user.role === 'MECHANIC' && assistanceRequest.mechanicId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para concluir esta solicitação' },
        { status: 403 }
      );
    }

    // Iniciar uma transação para garantir que ambas as operações sejam concluídas com sucesso
    await prisma.$transaction(async (tx) => {
      // Atualizar a solicitação
      await tx.assistanceRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Atualizar o status do mecânico para disponível
      await tx.user.update({
        where: {
          id: assistanceRequest.mechanicId,
        },
        data: {
          status: 'AVAILABLE',
        },
      });
    });

    // Redirecionar de volta para a página apropriada
    if (session.user.role === 'MANAGER') {
      return NextResponse.redirect(new URL(`/dashboard/manager/requests/${id}`, request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard/mechanic', request.url));
    }
  } catch (error) {
    console.error('Erro ao concluir solicitação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 