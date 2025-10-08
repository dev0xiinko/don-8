import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { sendVerificationEmail } from '@/lib/mailer';
import { backupNgoApplication } from '@/lib/backup-db';

export async function POST(req: Request) {
  // API endpoint for NGO application registration
  console.log("=== NGO REGISTRATION API CALLED ===");
  
  try {
    const body = await req.json();
    console.log("Received NGO registration request:", body);

    // Load existing applications
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json');
    let applications = [];
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(fileContent);
      applications = Array.isArray(parsed) ? parsed : [];
      console.log(`Loaded ${applications.length} existing applications`);
    } catch (error) {
      // If file doesn't exist or is empty, start with empty array
      console.log('Creating new applications file');
      applications = [];
    }

    // Generate new application ID
    const maxId = applications.length > 0 ? Math.max(...applications.map((app: any) => app.id)) : 0;
    const newId = maxId + 1;

    // Create new application object
    // Generate initial email verification fields
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCode = generateCode();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const newApplication = {
      id: newId,
      organizationName: body.name, // Form sends 'name' not 'organizationName'
      email: body.email,
      phone: body.phone || "",
      description: body.description,
      address: body.address || "",
      registrationNumber: body.registrationNumber,
      taxId: body.taxId || "",
      bankAccountDetails: body.bankAccountDetails || "",
      walletAddress: body.walletAddress,
      contactPersonName: body.contactPersonName || "",
      uploadedDocuments: body.uploadedDocuments || [],
      website: body.website || "",
      category: body.category || "general",
      foundedYear: body.foundedYear || "",
      teamSize: body.teamSize || "",
      twitter: body.twitter || "",
      facebook: body.facebook || "",
      linkedin: body.linkedin || "",
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      // Store the actual password provided during registration
      registrationPassword: body.password,
      credentials: null,
      // Email verification
      emailVerified: false,
      verificationCode,
      verificationExpiresAt
    };

    // Add to applications array
    console.log('Adding new application:', { id: newId, name: newApplication.organizationName });
    applications.push(newApplication);

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));

    // Fire-and-forget: send verification email in background so response is not blocked
    sendVerificationEmail(body.email, verificationCode)
      .then(() => console.info('Verification email sent on registration'))
      .catch((e) => console.warn('Verification email failed to send on registration. User can resend.', e))
    console.log(`Saved ${applications.length} applications to file`);

    // Fire-and-forget: backup to external DB or webhook if configured
    backupNgoApplication(newApplication)
      .then(() => console.info('Backup of NGO application completed (if configured)'))
      .catch((e) => console.warn('Backup of NGO application failed', e))

    return NextResponse.json({
      success: true,
      message: "NGO application submitted successfully. Verification code sent to email.",
      applicationId: newId
    });

  } catch (error: any) {
    console.error("NGO registration error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit NGO application"
      },
      { status: 500 }
    );
  }
}
