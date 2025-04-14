// app/api/projects/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function getUserId(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    return userId;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = parseInt(params.id, 10);
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = parseInt(params.id, 10);
  const { name, description } = await request.json();

  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!existing) {
    return NextResponse.json(
      { error: 'Project not found or forbidden' },
      { status: 404 }
    );
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name ?? existing.name,
      description: description ?? existing.description,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = parseInt(params.id, 10);
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { tasks: true },
  });
  if (!project) {
    return NextResponse.json(
      { error: 'Project not found or forbidden' },
      { status: 404 }
    );
  }

  await prisma.task.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ message: 'Project deleted' });
}
