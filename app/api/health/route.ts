import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Frontend health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'don-8-frontend',
      version: '2.1.0'
    };
    
    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Frontend health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}