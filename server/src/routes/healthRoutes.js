
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await req.app.locals.prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "AI GATE Mentor API is running",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(500).json({
      success: false,
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

export default router;
