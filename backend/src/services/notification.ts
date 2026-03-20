import nodemailer from "nodemailer";

export class NotificationService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST as string, 
    port: Number(process.env.SMTP_PORT), 
    secure: false, 
    auth: {
      user: process.env.SMTP_USER as string, 
      pass: process.env.SMTP_PASSWORD as string,
    },
  });

  private static async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `"HR Blockexcel" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }

  // Interview Scheduled
  public static async sendInterviewScheduled(
    to: string,
    candidateName: string,
    date: string
  ) {
    return this.sendEmail(
      to,
      "Interview Scheduled",
      `<p>Hi ${candidateName}, your interview is scheduled on <b>${date}</b>.</p>`
    );
  }

  //  Reschedule
  public static async sendRescheduleRequest(to: string, candidateName: string) {
    return this.sendEmail(
      to,
      "Interview Reschedule",
      `<p>Hi ${candidateName}, your interview needs to be rescheduled.</p>`
    );
  }

  //  Reminder
  public static async sendScorecardReminder(to: string, interviewerName: string) {
    return this.sendEmail(
      to,
      "Scorecard Reminder",
      `<p>Hi ${interviewerName}, please submit your scorecard.</p>`
    );
  }
}