import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("Received NGO registration request:", body);

    // Transform frontend form data to match backend DTO
    const ngoApplicationData = {
      name: body.name,
      email: body.email,
      password: body.password,
      description: body.description,
      website: body.website,
      category: body.category,
      agreeTerms: body.agreeTerms || false,
      registrationNumber: body.registrationNumber,
      foundedYear: body.foundedYear,
      teamSize: body.teamSize,
      twitter: body.twitter,
      facebook: body.facebook,
      linkedin: body.linkedin,
      walletAddress: body.walletAddress || ""
    };

    console.log("Sending to backend:", ngoApplicationData);

    // Send to backend
    const backendResponse = await fetch(`${BACKEND_URL}/ngo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ngoApplicationData),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error("Backend error:", errorData);
      throw new Error(`Backend error: ${backendResponse.status} ${errorData}`);
    }

    const result = await backendResponse.json();
    console.log("Backend response:", result);

    return NextResponse.json({
      success: true,
      message: "NGO application submitted successfully",
      applicationId: result.id,
      data: result
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
