
import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.post("/explain", async (req, res) => {
  try {
    const {
      question,
      subject,
      topic,
      options,
      studentAttempt,
    } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a question.",
      });
    }

    if (question.length > 8000) {
      return res.status(400).json({
        success: false,
        message: "Question must be under 8000 characters.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert GATE Computer Science mentor.

Explain the following question to a student preparing for GATE.

Subject: ${subject || "Not specified"}
Topic: ${topic || "Not specified"}
Question: ${question}
Options: ${options || "Not provided"}
Student's attempt: ${studentAttempt || "Not provided"}

Use this structure:

1. CONCEPT
Explain the underlying concept in beginner-friendly language.

2. STEP-BY-STEP SOLUTION
Solve the question logically. Show calculations where needed.

3. FINAL ANSWER
Clearly state the answer.

4. GATE EXAM TIP
Give a useful exam-oriented shortcut or observation.

5. COMMON MISTAKE
Explain a likely mistake students make.

Do not invent an official answer or claim verification.
If information is insufficient or ambiguous, explicitly say so.
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1800,
      },
    });

    const explanation = response.text;

    if (!explanation) {
      throw new Error("Gemini returned an empty response.");
    }

    return res.json({
      success: true,
      data: { explanation },
    });
  } catch (error) {
    console.error("AI explanation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate an explanation. Please try again.",
    });
  }
});

export default router;
