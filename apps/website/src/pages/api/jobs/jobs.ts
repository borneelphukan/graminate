import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../config/database";
import cors, { runMiddleware } from "../../../lib/corsMiddleware";

interface Job {
  id: number;
  position: string;
  type: string;
  mode: string;
  description: string;
  tasks: string[];
  requirements: string[];
  benefits: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res
      .status(405)
      .json({ error: `Method '${req.method}' Not Allowed` });
  }

  try {
    const result = await pool.query(`
      SELECT
        id,
        position,
        type,
        mode,
        description,
        tasks,
        requirements,
        benefits
      FROM jobs
    `);

    const jobs: Job[] = result.rows.map((job: Record<string, unknown>) => ({
      id: job.id as number,
      position: job.position as string,
      type: job.type as string,
      mode: job.mode as string,
      description: job.description as string,
      tasks: (job.tasks as string[]) || [],
      requirements: (job.requirements as string[]) || [],
      benefits: (job.benefits as string[]) || [],
    }));

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
