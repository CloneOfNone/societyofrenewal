import { z } from "zod";

export const waitlistFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required." })
      .email({ message: "Enter a valid email address." }),
    path: z.enum(["lottery", "need"]),
    reason: z
      .string()
      .trim()
      .max(800, { message: "Keep your note under 800 characters." })
      .default(""),
    turnstileToken: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.path === "need" && (!data.reason || data.reason.length < 40)) {
      ctx.addIssue({
        path: ["reason"],
        code: z.ZodIssueCode.custom,
        message: "Share a short note (40+ characters) about your need.",
      });
    }
  });

export type WaitlistInput = z.infer<typeof waitlistFormSchema>;
