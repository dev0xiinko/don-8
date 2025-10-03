import { NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteParams) {
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

    // TODO: Connect to backend API instead of direct database
    // const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // await fetch(`${backendUrl}/ngo/${id}/status`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
    //   body: JSON.stringify({ status: 'REJECTED', notes })
    // });

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