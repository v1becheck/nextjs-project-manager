import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
function getUserId(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserId(request);
  const taskId = parseInt(params.id, 10);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { userId: userId } },
  });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserId(request);
  const taskId = parseInt(params.id, 10);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const { title, description } = data;

  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { userId: userId } },
  });
  if (!task) {
    return NextResponse.json(
      { error: 'Task not found or forbidden' },
      { status: 404 }
    );
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserId(request);
  const taskId = parseInt(params.id, 10);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { userId: userId } },
  });
  if (!task) {
    return NextResponse.json(
      { error: 'Task not found or forbidden' },
      { status: 404 }
    );
  }
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ message: 'Task deleted' });
}
