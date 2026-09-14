import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { description } = await req.json();

  if (!description) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  const smtpUser = process.env.SMTP_USER; // e.g. sivabavithran16@gmail.com
  const smtpPass = process.env.SMTP_PASS; // App Password

  if (!smtpUser || !smtpPass) {
    // If no credentials, log the bug and return an error (or mock success for dev)
    console.warn("SMTP credentials missing. Bug logged but not emailed:");
    console.warn(description);
    return NextResponse.json({ error: "SMTP not configured" }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"ContextBridge Bug Reporter" <${smtpUser}>`,
      to: "sivabavithran16@gmail.com",
      subject: `New Bug Report from ${session.user.name || session.user.email}`,
      text: description,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send bug report email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
