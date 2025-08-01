"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export async function submitContactForm(formData: ContactFormData) {
  try {
    // Validate the form data
    const validatedData = contactSchema.parse(formData);

    // Make request to our API route
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"}/api/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send message");
    }

    const result = await response.json();
    return { success: true, message: "Message sent successfully!" };
  } catch (error) {
    console.error("Contact form submission error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Please check your form data",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}
