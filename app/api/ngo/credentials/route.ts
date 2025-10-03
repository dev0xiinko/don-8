import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
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

    // Find all approved NGOs with credentials
    const approvedNgos = applications
      .filter((app: any) => app.status === 'approved' && app.credentials)
      .map((app: any) => ({
        id: app.id,
        organizationName: app.organizationName,
        email: app.credentials.email,
        // Don't include password for security, just indicate it exists
        hasCredentials: true
      }));

    return NextResponse.json({
      success: true,
      approvedNgos
    });

  } catch (error) {
    console.error("NGO credentials fetch error:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}