// Path: ./src/app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      placas: 'GET /api/placas'
    }
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'POST test endpoint working!',
    timestamp: new Date().toISOString()
  });
}