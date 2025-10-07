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
    const normalizedEmail = (applications[applicationIndex].email || '').toString().trim().toLowerCase();
  const generatedFallback = `${applications[applicationIndex].organizationName.toLowerCase().replace(/\s+/g, '')}123`;
  const finalPassword = applications[applicationIndex].registrationPassword || generatedFallback;

    applications[applicationIndex] = {
      ...applications[applicationIndex],
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin@don8.com',
      reviewNotes: reviewNotes || 'Application approved for platform access.',
      credentials: {
        email: normalizedEmail,
        // Use the password provided during registration, fallback to generated one if not available
        password: finalPassword
      }
    };
    
    // Safety: backfill credentials for any approved entries missing credentials (data hygiene)
    for (const app of applications) {
      if (app.status === 'approved' && !app.credentials) {
        const emailNorm = (app.email || '').toString().trim().toLowerCase();
        const pwd = app.registrationPassword || `${(app.organizationName || '').toLowerCase().replace(/\s+/g, '')}123`;
        app.credentials = { email: emailNorm, password: pwd };
      }
    }

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));

    // Best-effort: notify applicant via email
    try {
      const app = applications[applicationIndex]
      if (app?.email) {
        const includeTemp = !applications[applicationIndex].registrationPassword
        await sendApplicationStatusEmail(app.email, 'approved', app.organizationName || app.name, reviewNotes, includeTemp ? finalPassword : undefined)
      }
    } catch (e) {
      console.warn('Failed to send approval email:', e)
    }
    
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