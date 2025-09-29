import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const applications = await prisma.ngoApplication.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json(applications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  } else {
    res.status(405).end();
  }
}
