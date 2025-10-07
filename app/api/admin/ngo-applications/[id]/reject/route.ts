import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendApplicationStatusEmail } from '@/lib/mailer';

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
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin@don8.com',
      reviewNotes: reviewNotes || 'Application rejected. Please review and resubmit with additional information.',
      credentials: null
    };
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));

    // Best-effort: notify applicant via email
    try {
      const app = applications[applicationIndex]
      if (app?.email) {
        await sendApplicationStatusEmail(app.email, 'rejected', app.organizationName || app.name, reviewNotes)
      }
    } catch (e) {
      console.warn('Failed to send rejection email:', e)
    }

    return NextResponse.json({
      message: 'Application rejected successfully',
      application: applications[applicationIndex]
    });
  } catch (error: any) {
    console.error("Error rejecting NGO application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject application" },
      { status: 500 }
    );
  }
}