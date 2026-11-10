
import express from "express";

const router = express.Router();

const allowedDifficulties = ["EASY", "MEDIUM", "HARD"];

// GET /api/pyq - List and filter questions
router.get("/", async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;

    const {
      year,
      subject,
      topic,
      difficulty,
      examBranch = "CS",
      page = "1",
      limit = "20",
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const where = { examBranch };

    if (year) {
      const parsedYear = Number(year);

      if (!Number.isInteger(parsedYear) || parsedYear < 1980) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      where.year = parsedYear;
    }

    if (difficulty) {
      const normalizedDifficulty = String(difficulty).toUpperCase();

      if (!allowedDifficulties.includes(normalizedDifficulty)) {
        return res.status(400).json({
          success: false,
          message: "Difficulty must be EASY, MEDIUM or HARD",
        });
      }

      where.difficulty = normalizedDifficulty;
    }

    if (subject) {
      where.subject = {
        is: {
          OR: [
            { name: { contains: String(subject), mode: "insensitive" } },
            { code: { equals: String(subject), mode: "insensitive" } },
          ],
        },
      };
    }

    if (topic) {
      where.topic = {
        is: {
          name: { contains: String(topic), mode: "insensitive" },
        },
      };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          subject: true,
          topic: true,
          options: true,
          answer: true,
        },
        orderBy: [{ year: "desc" }, { questionNo: "asc" }],
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.question.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("PYQ list error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
});

// GET /api/pyq/stats - Dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;

    const [
      totalQuestions,
      verifiedQuestions,
      yearGroups,
      subjects,
    ] = await Promise.all([
      prisma.question.count(),

      prisma.question.count({
        where: { isVerified: true },
      }),

      prisma.question.groupBy({
        by: ["year"],
        _count: { _all: true },
        orderBy: { year: "asc" },
      }),

      prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const subjectStats = subjects
      .map((subject) => ({
        name: subject.name,
        count: subject._count.questions,
      }))
      .filter((subject) => subject.count > 0)
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        totalQuestions,
        verifiedQuestions,
        unverifiedQuestions: totalQuestions - verifiedQuestions,
        yearWise: yearGroups.map((item) => ({
          year: item.year,
          count: item._count._all,
        })),
        subjectWise: subjectStats,
      },
    });
  } catch (error) {
    console.error("PYQ statistics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch PYQ statistics",
    });
  }
});

// GET /api/pyq/:id - Get one question
router.get("/:id", async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;

    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        topic: true,
        options: true,
        answer: true,
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("PYQ detail error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch question",
    });
  }
});

export default router;
