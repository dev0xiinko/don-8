import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { sendApplicationStatusEmail } from '@/lib/mailer';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id);
    const body = await req.json();
    const { status, reviewNotes } = body;
    
    console.log(`Updating application ${applicationId} to status: ${status}`);

    // Load existing applications
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json');
    
    let applications = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      applications = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Applications file not found" },
        { status: 404 }
      );
    }

    // Find application by ID
    const applicationIndex = applications.findIndex((app: any) => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Update application status
    const app = applications[applicationIndex];
    app.status = status;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = "admin@don8.com";
    if (reviewNotes) {
      app.reviewNotes = reviewNotes;
    }

    // Generate credentials for approved applications (prefer registrationPassword if present)
    let tempPassword: string | undefined
    if (status === 'approved') {
      const orgName: string = app.organizationName || app.name || 'NGO';
      const normalizedEmail: string = (app.email || '').toString().trim().toLowerCase();
      const fallbackPassword = `${orgName.replace(/\s+/g, '')}2024`.substring(0, 16);
      const finalPassword = app.registrationPassword || fallbackPassword;

      app.credentials = {
        email: normalizedEmail,
        password: finalPassword,
      };
      console.log(`Credentials set for ${orgName} (${normalizedEmail}).`);
      if (!app.registrationPassword) tempPassword = finalPassword
    } else {
      // Remove credentials if not approved
      app.credentials = null;
    }

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));
    console.log(`Successfully updated application ${applicationId} -> ${status}`);

    // Best-effort: notify applicant via email on approved/rejected
    try {
      const target = applications[applicationIndex];
      if (target?.email && (status === 'approved' || status === 'rejected')) {
        await sendApplicationStatusEmail(
          target.email,
          status,
          target.organizationName || target.name,
          reviewNotes,
          status === 'approved' ? tempPassword : undefined
        );
        console.log(`Status email sent to ${target.email} for ${status}.`);
      }
    } catch (e) {
      console.warn('Failed to send status email:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      application: applications[applicationIndex]
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}