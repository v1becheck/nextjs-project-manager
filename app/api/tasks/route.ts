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

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const projectIdParam = searchParams.get('projectId');
  let projectFilter = {};
  if (projectIdParam) {
    const pid = parseInt(projectIdParam, 10);
    projectFilter = { id: pid, userId };
  }

  const tasks = await prisma.task.findMany({
    where: { project: { userId, ...projectFilter } },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const { title, description, projectId, status, due_date, priority } = data;

  if (!title || !projectId) {
    return NextResponse.json(
      { error: 'Title and projectId are required' },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 404 });
  }

  let dueDateObj: Date | undefined = undefined;
  if (due_date) {
    dueDateObj = new Date(due_date);
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || '',
      status: status || 'todo',
      due_date: dueDateObj,
      priority: priority || 'medium',
      projectId,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
