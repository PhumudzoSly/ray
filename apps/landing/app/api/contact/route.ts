import { NextRequest, NextResponse } from "next/server";
import { LoopsClient } from "loops";
import { z } from "zod";

if (!process.env.LOOPS_API_KEY) {
  throw new Error("Missing LOOPS_API_KEY environment variable");
}

const loops = new LoopsClient(process.env.LOOPS_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    const { name, email, message } = validatedData;

    // Send email using Loops
    const data = await loops.sendTransactionalEmail({
      transactionalId: "clz2b44a2000208ju953m5j3j",
      email: "phumudzo@rayai.dev",
      dataVariables: {
        name,
        email,
        message,
      }
    });

    return NextResponse.json(
      { message: "Email sent successfully", ...data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}