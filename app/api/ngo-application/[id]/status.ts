import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { status, reviewNotes } = req.body;
    try {
      const updated = await prisma.ngoApplication.update({
        where: { id: id as string },
        data: {
          status,
          reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: "admin_001", // Replace with real admin session
        },
      });
      res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update status" });
    }
  } else {
    res.status(405).end();
  }
}
