import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewNotes } = await request.json();
    const applicationId = parseInt(params.id);
    
    // Read current applications
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const applications = JSON.parse(fileContents);
    
    // Find and update the application
    const applicationIndex = applications.findIndex(
      (app: any) => app.id === applicationId
    );
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Update application status
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin@don8.com',
      reviewNotes: reviewNotes || 'Application approved for platform access.',
      credentials: {
        email: applications[applicationIndex].email,
        password: `${applications[applicationIndex].organizationName.toLowerCase().replace(/\s+/g, '')}123`
      }
    };
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));
    
    return NextResponse.json({
      message: 'Application approved successfully',
      application: applications[applicationIndex]
    });
    
  } catch (error) {
    console.error('Error approving application:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}