import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function getUserId(request: Request) {
  // @ts-ignore: Next.js injects cookies onto the Request
  const token = (request as any).cookies.get('token')?.value;
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

export async function GET(request: Request, context: unknown) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = (context as { params: { id: string } }).params;
  const taskId = parseInt(id, 10);

  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { userId } },
  });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(request: Request, context: unknown) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = (context as { params: { id: string } }).params;
  const taskId = parseInt(id, 10);
  const data = await request.json();
  const { title, description, status, priority, due_date } = data;

  const existing = await prisma.task.findFirst({
    where: { id: taskId, project: { userId } },
  });
  if (!existing) {
    return NextResponse.json(
      { error: 'Not found or forbidden' },
      { status: 404 }
    );
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: title ?? existing.title,
      description: description ?? existing.description,
      status: status ?? existing.status,
      priority: priority ?? existing.priority,
      due_date: due_date !== undefined ? new Date(due_date) : existing.due_date,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: unknown) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = (context as { params: { id: string } }).params;
  const taskId = parseInt(id, 10);

  const existing = await prisma.task.findFirst({
    where: { id: taskId, project: { userId } },
  });
  if (!existing) {
    return NextResponse.json(
      { error: 'Not found or forbidden' },
      { status: 404 }
    );
  }

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ message: 'Task deleted' });
}
