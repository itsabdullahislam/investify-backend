import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import http from "http";
import authRoutes from "./routes/auth.routes";
import campaignRoutes from "./routes/campaign.routes";
import cors from "cors";
import investorRoutes from "./routes/investor.routes";
import path from "path";
import innovatorRoutes from "./routes/innovator.routes";
import Likeroutes from "./routes/like.routes";
import investmentroutes from "./routes/investment.routes";
import cookieParser from "cookie-parser";
import { authenticateUser } from "./middleware/auth";
import chatRoutes from "./routes/chat.routes";
import { initSocket } from "./socket/socket";
import searchRoutes from "./routes/search.routes";
import notifyRoutes from "./routes/notification.routes";

dotenv.config();

// Define the PORT variable
const PORT = process.env.PORT || 3000;

const app = express();
app.options("*", cors({
origin: "https://nice-grass-01a8bd000.6.azurestaticapps.net",
credentials: true,
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(
  cors({
    origin: "https://nice-grass-01a8bd000.6.azurestaticapps.net",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(cookieParser());



// // Register routes
// // Fix: Typo in 'noitfy' → 'notify'
// app.use("/api/notify", notifyRoutes);

// // Specify distinct paths for each module to avoid ambiguous overlaps
// app.use("/api/search", searchRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/investment", investmentroutes);

// // Serve static uploads from '/uploads'
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// // Separate paths for innovator and investor routes to avoid overlapping '/api'
// app.use("/api/innovators", innovatorRoutes);
// app.use("/api/investors", investorRoutes);

// app.use("/api/auth", authRoutes);
// app.use("/api/campaigns", campaignRoutes);

// // Assign a proper path for likes (was using ambiguous '/api')
// app.use("/api/likes", Likeroutes);


AppDataSource.initialize()
.then(() => {
  console.log("Data Source has been initialized!");

  app.use("/api/notify", notifyRoutes);

  // Specify distinct paths for each module to avoid ambiguous overlaps
  app.use("/api/search", searchRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/investment", investmentroutes);

  // Serve static uploads from '/uploads'
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Separate paths for innovator and investor routes to avoid overlapping '/api'
  app.use("/api/innovators", innovatorRoutes);
  app.use("/api/investors", investorRoutes);

  app.use("/api/auth", authRoutes);
  app.use("/api/campaigns", campaignRoutes);

  // Assign a proper path for likes (was using ambiguous '/api')
  app.use("/api/likes", Likeroutes);

  
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    initSocket(server);
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
