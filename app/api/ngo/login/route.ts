import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('NGO Login attempt:', { email, password });

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
    
    const approvedNgo = applications.find((app: any) => 
      app.status === 'approved' && 
      app.credentials && 
      app.credentials.email === email && 
      app.credentials.password === password
    );

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