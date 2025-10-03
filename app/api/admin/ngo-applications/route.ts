import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read NGO applications from JSON file
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const applications = JSON.parse(fileContents);
    
    // Return the applications directly since it's now an array
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error reading NGO applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NGO applications' },
      { status: 500 }
    );
  }
}