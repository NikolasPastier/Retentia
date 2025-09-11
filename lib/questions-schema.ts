import { z } from "zod"

export const questionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      type: z.enum(["multiple-choice", "true-false", "open-ended", "fill-blank"]),
      options: z.array(z.string()).optional(), // Optional for non-multiple choice
      correctAnswer: z.union([z.number(), z.string()]), // Support both index and text answers
      explanation: z.string(),
    }),
  ),
})

export type QuestionsResponse = z.infer<typeof questionsSchema>
