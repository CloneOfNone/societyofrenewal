import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default(process.env.NODE_ENV ?? "development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().url().optional(),
  EMAIL_PROVIDER_API_KEY: z
    .string()
    .optional()
    .transform((value) => value ?? process.env.RESEND_API_KEY ?? undefined),
  RESEND_AUDIENCE_ID: z.string().optional(),
  TURNSTILE_SECRET: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  EMAIL_PROVIDER_API_KEY: process.env.EMAIL_PROVIDER_API_KEY,
  RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
});

export const isProduction = env.NODE_ENV === "production";
