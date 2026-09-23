import { Router } from "express";
import { z } from "zod";
import { notifyContactMessage } from "../lib/email.js";

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().optional().refine((val) => !val || val.trim().length >= 7, {
    message: "Mobile / Phone number must be at least 7 digits",
  }),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

contactRouter.post("/", async (req, res, next) => {
  try {
    const parsed = contactSchema.parse(req.body);

    // Trigger async email notification in background (fire-and-forget for instant API response)
    notifyContactMessage({
      name: parsed.name.trim(),
      email: parsed.email.trim(),
      phone: parsed.phone?.trim() || undefined,
      subject: parsed.subject?.trim() || undefined,
      message: parsed.message.trim(),
    }).catch((err) => {
      console.error("[Contact API] Email notification error:", err);
    });

    res.json({
      success: true,
      message: "Thank you for getting in touch. Your message has been sent successfully to our team.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      res.status(400).json({
        error: issue ? issue.message : "Validation failed",
        issues: error.issues,
      });
      return;
    }
    next(error);
  }
});
