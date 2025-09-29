import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newApplication = await prisma.ngoApplication.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // ⚠️ hash before storing in real apps
        description: data.description,
        website: data.website || null,
        category: data.category,
        registrationNumber: data.registrationNumber || null,
        foundedYear: data.foundedYear ? Number(data.foundedYear) : null,
        teamSize: data.teamSize || null,
        twitter: data.twitter || null,
        facebook: data.facebook || null,
        linkedin: data.linkedin || null,
        walletAddress: data.walletAddress,
        agreeTerms: Boolean(data.agreeTerms),
      },
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
