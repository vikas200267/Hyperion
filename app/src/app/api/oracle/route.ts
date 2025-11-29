import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to Phase 6 backend
    const phase6Response = await fetch('http://localhost:8000/oracle/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!phase6Response.ok) {
      const error = await phase6Response.json();
      return NextResponse.json(error, { status: phase6Response.status });
    }

    const data = await phase6Response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Phase 6 oracle error:', error);
    return NextResponse.json(
      { error: 'Failed to execute oracle' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check for Phase 6
    const phase6Response = await fetch('http://localhost:8000/health');
    const data = await phase6Response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: 'offline', error: 'Phase 6 backend unavailable' },
      { status: 503 }
    );
  }
}
