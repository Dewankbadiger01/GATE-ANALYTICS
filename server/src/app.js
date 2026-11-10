
import express from "express";
import cors from "cors";
import prisma from "./config/database.js";
import healthRoutes from "./routes/healthRoutes.js";
import pyqRoutes from "./routes/pyqRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.locals.prisma = prisma;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI GATE Mentor API",
    version: "1.0.0",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/pyq", pyqRoutes);
app.use("/api/ai", aiRoutes);
app.get("/api/subjects", async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        topics: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error("Subject fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
});

export default app;
