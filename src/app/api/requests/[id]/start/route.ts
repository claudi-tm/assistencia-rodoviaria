import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário está autenticado e é um mecânico
  if (!session || session.user.role !== 'MECHANIC') {
    return NextResponse.json(
      { error: 'Não autorizado. Apenas mecânicos podem iniciar atendimentos.' },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    // Verificar se a solicitação existe e está atribuída ao mecânico
    const assistanceRequest = await prisma.assistanceRequest.findUnique({
      where: {
        id,
        mechanicId: session.user.id,
        status: 'ASSIGNED',
      },
    });

    if (!assistanceRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada ou não está atribuída a você' },
        { status: 404 }
      );
    }

    // Atualizar o status da solicitação para EM ANDAMENTO
    await prisma.assistanceRequest.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    // Redirecionar de volta para a página de detalhes da solicitação
    return NextResponse.redirect(new URL(`/dashboard/mechanic/requests/${id}`, request.url));
  } catch (error) {
    console.error('Erro ao iniciar atendimento:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 