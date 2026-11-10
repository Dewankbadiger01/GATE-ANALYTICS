
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const allowedTypes = ["MCQ", "MSQ", "NAT"];
const allowedDifficulties = ["EASY", "MEDIUM", "HARD"];

function validateQuestion(q, index) {
  const errors = [];
  const label = `Question ${index + 1}`;

  if (!q || typeof q !== "object") {
    return [`${label}: Invalid question object`];
  }

  if (!q.questionCode?.trim()) errors.push("Missing questionCode");
  if (!Number.isInteger(Number(q.year)) || Number(q.year) < 1980) {
    errors.push("Invalid year");
  }
  if (!q.subject?.trim()) errors.push("Missing subject");
  if (!q.topic?.trim()) errors.push("Missing topic");
  if (!q.questionText?.trim()) errors.push("Missing questionText");

  if (!allowedTypes.includes(q.questionType)) {
    errors.push("questionType must be MCQ, MSQ or NAT");
  }

  if (!allowedDifficulties.includes(q.difficulty)) {
    errors.push("difficulty must be EASY, MEDIUM or HARD");
  }

  if (!Number.isInteger(Number(q.questionNo)) || Number(q.questionNo) < 1) {
    errors.push("questionNo must be a positive integer");
  }

  if (!Number.isFinite(Number(q.marks)) || Number(q.marks) <= 0) {
    errors.push("marks must be a positive number");
  }

  if (q.questionType === "MCQ" || q.questionType === "MSQ") {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push("MCQ/MSQ requires at least two options");
    } else {
      const labels = q.options.map((option) => option.label);
      if (labels.some((label) => !label || !String(label).trim())) {
        errors.push("Every option needs a label");
      }
      if (new Set(labels).size !== labels.length) {
        errors.push("Option labels must be unique");
      }
      if (q.options.some((option) => !option.text?.trim())) {
        errors.push("Every option needs text");
      }
    }
  }

  if (q.questionType === "NAT" && q.options?.length) {
    errors.push("NAT questions should not have options");
  }

  return errors.map((error) => `${label}: ${error}`);
}

async function findSubject(subjectName) {
  return prisma.subject.findFirst({
    where: {
      OR: [
        { name: { equals: subjectName, mode: "insensitive" } },
        { code: { equals: subjectName, mode: "insensitive" } },
      ],
    },
  });
}

async function main() {
  const filePath = path.join(__dirname, "data", "questions.json");
  const rawData = await fs.readFile(filePath, "utf8");
  const questions = JSON.parse(rawData);

  if (!Array.isArray(questions)) {
    throw new Error("questions.json must contain a JSON array");
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Found ${questions.length} questions to process.\n`);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const errors = validateQuestion(q, i);

    if (errors.length) {
      console.log("INVALID:", errors.join(" | "));
      failed++;
      continue;
    }

    try {
      const existing = await prisma.question.findUnique({
        where: { questionCode: q.questionCode },
      });

      if (existing) {
        console.log(`SKIPPED: ${q.questionCode} already exists`);
        skipped++;
        continue;
      }

      const subject = await findSubject(q.subject);

      if (!subject) {
        console.log(`SKIPPED: Subject not found: ${q.subject}`);
        skipped++;
        continue;
      }

      const topic = await prisma.topic.findFirst({
        where: {
          name: { equals: q.topic, mode: "insensitive" },
          subjectId: subject.id,
        },
      });

      if (!topic) {
        console.log(
          `SKIPPED: Topic "${q.topic}" not found under ${subject.name}`
        );
        skipped++;
        continue;
      }

      await prisma.question.create({
        data: {
          questionCode: q.questionCode.trim(),
          year: Number(q.year),
          examBranch: q.examBranch || "CS",
          questionNo: Number(q.questionNo),
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          difficulty: q.difficulty,
          marks: Number(q.marks),
          subjectId: subject.id,
          topicId: topic.id,
          explanation: q.explanation || null,
          source: q.source || null,
          isVerified: false,

          options: q.options?.length
            ? {
                create: q.options.map((option) => ({
                  label: String(option.label).trim(),
                  text: option.text.trim(),
                })),
              }
            : undefined,

          answer: q.answer
            ? {
                create: {
                  value: String(
                    typeof q.answer === "object"
                      ? q.answer.value
                      : q.answer
                  ),
                  explanation:
                    typeof q.answer === "object"
                      ? q.answer.explanation || null
                      : null,
                  isVerified: false,
                },
              }
            : undefined,
        },
      });

      console.log(`IMPORTED: ${q.questionCode}`);
      imported++;
    } catch (error) {
      console.error(`FAILED: ${q.questionCode}`, error.message);
      failed++;
    }
  }

  console.log("\n========== IMPORT REPORT ==========");
  console.log(`Imported : ${imported}`);
  console.log(`Skipped  : ${skipped}`);
  console.log(`Failed   : ${failed}`);
  console.log("===================================");
}

main()
  .catch((error) => {
    console.error("Import process failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
