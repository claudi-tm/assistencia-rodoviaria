import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { status, action } = await request.json();
    const { id } = params;

    // Verificar se a solicitação existe
    const assistanceRequest = await prisma.assistanceRequest.findUnique({
      where: { id },
    });

    if (!assistanceRequest) {
      return NextResponse.json(
        { message: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões com base na ação
    if (action === 'assign') {
      // Apenas gerentes podem atribuir solicitações a mecânicos
      if (session.user.role !== 'MANAGER') {
        return NextResponse.json(
          { message: 'Apenas gerentes podem atribuir solicitações a mecânicos' },
          { status: 403 }
        );
      }

      // Verificar se a solicitação já está atribuída
      if (assistanceRequest.mechanicId) {
        return NextResponse.json(
          { message: 'Esta solicitação já está atribuída a um mecânico' },
          { status: 400 }
        );
      }

      // Atribuir a solicitação ao mecânico
      const updatedRequest = await prisma.assistanceRequest.update({
        where: { id },
        data: {
          status: 'ASSIGNED',
          mechanicId: session.user.id,
        },
      });

      return NextResponse.json(updatedRequest);
    } else if (action === 'update') {
      // Verificar se o mecânico está atribuído à solicitação
      if (session.user.role === 'MECHANIC' && assistanceRequest.mechanicId !== session.user.id) {
        return NextResponse.json(
          { message: 'Você não está atribuído a esta solicitação' },
          { status: 403 }
        );
      }

      // Verificar se o status é válido
      if (!['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return NextResponse.json(
          { message: 'Status inválido' },
          { status: 400 }
        );
      }

      // Verificar transições de status válidas
      if (
        (assistanceRequest.status === 'PENDING' && status !== 'ASSIGNED') ||
        (assistanceRequest.status === 'ASSIGNED' && !['IN_PROGRESS', 'CANCELLED'].includes(status)) ||
        (assistanceRequest.status === 'IN_PROGRESS' && !['COMPLETED', 'CANCELLED'].includes(status)) ||
        (assistanceRequest.status === 'COMPLETED') ||
        (assistanceRequest.status === 'CANCELLED')
      ) {
        return NextResponse.json(
          { message: 'Transição de status inválida' },
          { status: 400 }
        );
      }

      // Atualizar o status da solicitação
      const updatedRequest = await prisma.assistanceRequest.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json(updatedRequest);
    }

    return NextResponse.json(
      { message: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar solicitação' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Buscar a solicitação
    const assistanceRequest = await prisma.assistanceRequest.findUnique({
      where: { id },
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

    if (!assistanceRequest) {
      return NextResponse.json(
        { message: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isDriver = session.user.role === 'DRIVER' && assistanceRequest.driverId === session.user.id;
    const isMechanic = session.user.role === 'MECHANIC' && (
      assistanceRequest.mechanicId === session.user.id || assistanceRequest.status === 'PENDING'
    );
    const isManager = session.user.role === 'MANAGER';

    if (!isDriver && !isMechanic && !isManager) {
      return NextResponse.json(
        { message: 'Você não tem permissão para visualizar esta solicitação' },
        { status: 403 }
      );
    }

    return NextResponse.json(assistanceRequest);
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar solicitação' },
      { status: 500 }
    );
  }
} 