import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'DRIVER') {
      return NextResponse.json(
        { message: 'Apenas condutores podem solicitar assistência' },
        { status: 403 }
      );
    }

    const { problemType, description, location } = await request.json();

    // Validar os dados
    if (!problemType || !description || !location) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar a solicitação
    const assistanceRequest = await prisma.assistanceRequest.create({
      data: {
        problemType,
        description,
        location,
        status: 'PENDING',
        driverId: session.user.id
      }
    });

    return NextResponse.json(
      { message: 'Solicitação criada com sucesso', assistanceRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    return NextResponse.json(
      { message: 'Erro ao criar solicitação' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause: any = {};

    // Filtrar por papel do usuário
    if (session.user.role === 'DRIVER') {
      whereClause.driverId = session.user.id;
    } else if (session.user.role === 'MECHANIC') {
      whereClause.OR = [
        { mechanicId: session.user.id },
        { mechanicId: null, status: 'PENDING' }
      ];
    }

    // Filtrar por status, se fornecido
    if (status) {
      whereClause.status = status;
    }

    const assistanceRequests = await prisma.assistanceRequest.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        mechanic: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(assistanceRequests);
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar solicitações' },
      { status: 500 }
    );
  }
} 