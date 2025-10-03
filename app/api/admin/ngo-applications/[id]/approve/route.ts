import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // TODO: Implement NGO application approval
    // This should connect to your NestJS backend
    
    return NextResponse.json(
      { 
        message: `NGO application ${id} approved`,
        status: 'approved'
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to approve NGO application' },
      { status: 500 }
    );
  }
}