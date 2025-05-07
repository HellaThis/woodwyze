import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'branches.json');
    const jsonData = await fs.readFile(dataPath, 'utf-8');
    const branches = JSON.parse(jsonData);

    if (branches[username]) {
      return NextResponse.json(branches[username]);
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}