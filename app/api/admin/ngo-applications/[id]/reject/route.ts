import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { notes } = body;
    const { id } = params;
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer admin_')) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`Rejecting application ${id} with notes:`, notes);

    // Update database
    await prisma.ngoApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNotes: notes,
        reviewedAt: new Date(),
        reviewedBy: 'admin', // In production, get from auth token
        reviewNotes: notes
      }
    });

    return NextResponse.json({
      message: 'Application rejected successfully',
      applicationId: id,
      status: 'REJECTED',
      notes: notes
    });
  } catch (error: any) {
    console.error("Error rejecting NGO application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject application" },
      { status: 500 }
    );
  }
}