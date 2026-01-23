import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import { initDb } from "./Database/Config/config.db.js";
import authRouter from "./Router/authRouter.js";
import courseRouter from "./Router/courseRouter.js";
import blogRouter from "./Router/blogRouter.js";
import testimonialRouter from "./Router/testimonialRouter.js";
import registrationRouter from "./Router/registrationRouter.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. CORS MIDDLEWARE (MUST BE FIRST)
// ==========================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://bright-coders-live-website.vercel.app",
  "https://bright-coders-website-nu.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman/Mobile)
      if (!origin) return callback(null, true);

      // Check if origin is in whitelist OR is any vercel.app subdomain
      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

      if (isAllowed) {
        callback(null, true);
      } else {
        // Instead of throwing an Error that crashes Render, we just block the request
        console.error(`🛑 Blocked by CORS: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// ==========================================
// 2. SECURITY & PARSING
// ==========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:", "http://localhost:8000"],
      },
    },
  }),
);

app.use(express.json());

// ==========================================
// 3. ROUTES
// ==========================================
app.use("/api/auth", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/registration", registrationRouter);

// Static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Bright Coders API is running ✅");
});

// ==========================================
// 4. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 8000;

// Initialize DB then start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
      console.log(`🌍 Production URL: https://brightcoders-api.onrender.com`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize DB:", err);
    process.exit(1); // Exit if DB fails
  });

// {

//   remember to include this for security purposes

// dotenv – Loads environment variables from a .env file into process.env to keep sensitive configuration data secure and separate from source code.

// helmet – Secures Express applications by setting HTTP response headers that protect against common web vulnerabilities.

// cors – Controls which external domains are allowed to access your backend resources, enabling safe communication between frontend and backend.

// bcryptjs – Hashes passwords before storing them in the database to protect user credentials even if the database is compromised.

// jsonwebtoken (JWT) – Creates and verifies secure tokens used for user authentication and authorization without storing sessions on the server.

// express-validator – Validates and sanitizes incoming request data to prevent invalid input, injection attacks, and application errors.

// express-rate-limit – Limits the number of requests a client can make in a given time period to prevent brute-force and denial-of-service attacks.

// hpp (HTTP Parameter Pollution) – Protects the server from attacks that manipulate duplicate query parameters in HTTP requests.

// xss-clean – Sanitizes user input to remove malicious scripts and prevent Cross-Site Scripting (XSS) attacks.

// compression – Compresses HTTP responses to reduce payload size and improve application performance and load speed.

// morgan – Logs HTTP requests and responses for monitoring, debugging, and auditing server activity.

// multer – Handles secure file uploads such as images and documents by processing multipart form data in Express.

// uuid – Generates universally unique identifiers to safely identify resources like users, files, or records without collisions.

// }
