import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../config/database";
// import multer from "multer";
// import path from "path";
import { createRouter } from "next-connect";
import cors, { runMiddleware } from "../../../lib/corsMiddleware";
import type { Request } from "express";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

interface ExtendedNextApiRequest extends NextApiRequest {
  file?: Express.Multer.File;
  cookies: Request["cookies"];
}

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// router.use((req, res, next) => {
//   upload.single("cvFile")(
//     req as unknown as Request,
//     res as any,
//     (err?: unknown) => {
//       if (err instanceof Error) {
//         return res.status(500).json({ error: "File upload error" });
//       }
//       next();
//     }
//   );
// });

router.post(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);

  try {
    const { position, firstName, lastName, email, phone, portfolio } = req.body;

    if (!position || !firstName || !lastName || !email || !phone || !req.file) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    const cvFilePath = `/uploads/${req.file.filename}`;

    const jobResult = await pool.query(
      "SELECT id FROM jobs WHERE position = $1 LIMIT 1",
      [position]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found." });
    }

    const jobId = jobResult.rows[0].id;

    const insertQuery = `
      INSERT INTO job_applications 
      (job_id, first_name, last_name, email, phone, portfolio, cv_file) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`;

    const result = await pool.query(insertQuery, [
      jobId,
      firstName,
      lastName,
      email,
      phone,
      portfolio || null,
      cvFilePath,
    ]);

    return res.status(201).json({
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router.handler();

export const config = {
  api: {
    bodyParser: false,
  },
};
