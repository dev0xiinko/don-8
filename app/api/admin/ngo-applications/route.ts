import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read NGO applications from JSON file
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const applications = JSON.parse(fileContents);

    const getTimestamp = (app: any): number => {
      const candidates = [
        app.submittedAt,
        app.createdAt,
        app.reviewedAt,
        app.updatedAt,
      ].filter(Boolean);
      for (const val of candidates) {
        const t = Date.parse(val);
        if (!Number.isNaN(t)) return t;
      }
      // Fallback: try numeric id if dates are missing
      if (typeof app.id === 'number') return app.id;
      return 0;
    };

    const sorted = Array.isArray(applications)
      ? [...applications].sort((a, b) => getTimestamp(b) - getTimestamp(a))
      : applications;
    
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error reading NGO applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NGO applications' },
      { status: 500 }
    );
  }
}