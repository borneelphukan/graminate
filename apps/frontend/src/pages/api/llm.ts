import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const response = await axios.post(`${backendUrl}/llm`, req.body);
    return res.status(200).json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("Error in LLM proxy:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json(
      err.response?.data || { error: "Failed to communicate with LLM service" }
    );
  }
}
