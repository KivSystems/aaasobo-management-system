import { server } from "../src/server";
import dotenv from "dotenv";

dotenv.config();

// For local development
if (process.env.NODE_ENV === "development") {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`[Server]: http://localhost:${PORT}`);
  });
}

// For Vercel serverless deployment
export default server;
