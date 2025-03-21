import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário está autenticado e é um gerente
  if (!session || session.user.role !== 'MANAGER') {
    return NextResponse.json(
      { error: 'Não autorizado. Apenas gerentes podem atribuir solicitações.' },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    // Processar dados do formulário em vez de JSON
    const formData = await request.formData();
    const mechanicId = formData.get('mechanicId') as string;

    if (!mechanicId) {
      return NextResponse.json(
        { error: 'ID do mecânico é obrigatório' },
        { status: 400 }
      );
    }

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

    // Verificar se a solicitação já está atribuída, cancelada ou concluída
    if (assistanceRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta solicitação não pode ser atribuída no estado atual' },
        { status: 400 }
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
    await prisma.$transaction(async (tx) => {
      // Atualizar a solicitação
      await tx.assistanceRequest.update({
        where: { id },
        data: {
          status: 'ASSIGNED',
          mechanicId: mechanicId,
        },
      });

      // Atualizar o status do mecânico para ocupado
      await tx.user.update({
        where: {
          id: mechanicId,
        },
        data: {
          status: 'BUSY',
        },
      });
    });

    return NextResponse.redirect(new URL(`/dashboard/manager/requests/${id}`, request.url));
  } catch (error) {
    console.error('Erro ao atribuir solicitação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 