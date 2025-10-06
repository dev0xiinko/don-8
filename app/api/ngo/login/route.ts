import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const inputEmail = (email || '').toString().trim().toLowerCase();
    const inputPassword = (password || '').toString();
    console.log('NGO Login attempt:', { email: inputEmail });

    // Load NGO applications from JSON file
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json');
    
    let applications = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      applications = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading NGO applications file:', error);
      return NextResponse.json(
        { success: false, message: "System error. Please try again later." },
        { status: 500 }
      );
    }

    // Find approved NGO with matching credentials
    console.log('Looking for approved NGOs...');
    console.log('Total applications:', applications.length);
    
    const approvedApps = applications.filter((app: any) => app.status === 'approved');
    console.log('Approved applications:', approvedApps.length);
    
    const approvedWithCredentials = approvedApps.filter((app: any) => app.credentials);
    console.log('Approved with credentials:', approvedWithCredentials.length);
    
    if (approvedWithCredentials.length > 0) {
      console.log('First approved NGO credentials:', approvedWithCredentials[0].credentials);
    }
    
    // Try to match against credentials, with email normalization.
    let approvedNgo = applications.find((app: any) => {
      if (app.status !== 'approved') return false;
      const creds = app.credentials || {};
      const storedEmail = (creds.email || app.email || '').toString().trim().toLowerCase();
      const storedPassword = creds.password;
      return storedEmail === inputEmail && storedPassword === inputPassword;
    });

    // Fallback: for approved NGOs missing credentials block (older records), allow login using registrationPassword
    if (!approvedNgo) {
      approvedNgo = applications.find((app: any) => {
        if (app.status !== 'approved') return false;
        const storedEmail = (app.email || '').toString().trim().toLowerCase();
        const storedPassword = app.registrationPassword; // plaintext stored during registration
        return storedEmail === inputEmail && storedPassword === inputPassword;
      });
    }

    console.log('Match found:', !!approvedNgo);

    if (!approvedNgo) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials or organization not approved." },
        { status: 401 }
      );
    }

    // Return NGO information for successful login
    return NextResponse.json({
      success: true,
      message: "Login successful",
      ngo: {
        id: approvedNgo.id,
        organizationName: approvedNgo.organizationName,
        email: approvedNgo.email,
        walletAddress: approvedNgo.walletAddress,
        status: approvedNgo.status,
        approvedAt: approvedNgo.reviewedAt
      }
    });

  } catch (error) {
    console.error("NGO login error:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}