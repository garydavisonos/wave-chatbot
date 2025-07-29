import { NextApiRequest, NextApiResponse } from "next";
import data from "@/data/data.json";
import Fuse from "fuse.js";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const fuse = new Fuse(data, {
      keys: ["question", "answer"],
      threshold: 0.4,
    });

    const result = fuse.search(query);

    if (result.length > 0) {
      return res.status(200).json({
        answer: result[0].item.answer,
      });
    } else {
      return res.status(200).json({
        answer: "Sorry, I couldn't find information on that for you.",
      });
    }
  } catch (error) {
    console.error("Error initializing Fuse.js:", error);
    return res.status(500).json({ error: "Error initializing search" });
  }
}
