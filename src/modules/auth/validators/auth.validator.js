import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().min(3),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email().min(3),
  password: z.string().min(6),
});