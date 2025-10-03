import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

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
    applications[applicationIndex].status = status;
    applications[applicationIndex].reviewedAt = new Date().toISOString();
    applications[applicationIndex].reviewedBy = "admin@don8.com";
    if (reviewNotes) {
      applications[applicationIndex].reviewNotes = reviewNotes;
    }

    // Generate credentials for approved applications
    if (status === 'approved') {
      const orgName = applications[applicationIndex].organizationName;
      const email = applications[applicationIndex].email;
      
      // Generate simple credentials
      const credentials = {
        email: email,
        password: `${orgName.replace(/\s+/g, '')}2024`.substring(0, 16)
      };
      
      applications[applicationIndex].credentials = credentials;
      console.log(`Generated credentials for ${orgName}:`, credentials);
    } else {
      // Remove credentials if not approved
      applications[applicationIndex].credentials = null;
    }

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));
    console.log(`Successfully updated application ${applicationId}`);

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