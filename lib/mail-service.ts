// lib/mail-service.ts
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import AdminNotificationEmail from "./email-templates/admin-notification";
import PaymentSuccessEmail from "./email-templates/payment-success";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPaymentSuccessEmail(
  userEmail: string,
  amount: number,
  credits: number,
  paymentId: string
) {
  const emailHtml = render(
    PaymentSuccessEmail({
      amount,
      credits,
      paymentId,
    })
  );

  try {
    // Send customer email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "Payment Successful - Green Claims Validator",
      html: emailHtml,
    });

    // Send admin notification
    const adminEmailHtml = render(
      AdminNotificationEmail({
        userEmail,
        amount,
        credits,
        paymentId,
      })
    );

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: "New Payment Received",
      html: adminEmailHtml,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw the error - we don't want to break the payment flow
    // just because email sending failed
  }
}
