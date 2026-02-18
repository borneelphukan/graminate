import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// Initialize the CORS middleware
const cors = Cors({
  origin: "*", // Allows all origins. Change this to your frontend URL for security.
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed request methods
});

// Helper function to run middleware in Next.js API routes
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (err?: unknown) => void
  ) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result?: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });
}

export default cors;
