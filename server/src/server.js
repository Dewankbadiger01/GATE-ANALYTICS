
import app from "./app.js";
import prisma from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Neon PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`AI GATE Mentor API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  console.log("\nClosing database connection...");
  await prisma.$disconnect();
  process.exit(0);
});
