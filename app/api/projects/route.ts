import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function getUserIdFromRequest(request: NextRequest): number | null {
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
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: userId },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { name, description } = data;
  if (!name) {
    return NextResponse.json(
      { error: 'Project name is required' },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      name: name,
      description: description || '',
      userId: userId,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
