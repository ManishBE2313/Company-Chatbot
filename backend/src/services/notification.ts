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

  // NEW: SharePoint Grant Request
  public static async sendSharepointGrantRequest(
    to: string, 
    folderUrl: string, 
    clientId: string,
    encodedUrl: string
  ) {
    const payload = JSON.stringify({
      roles: ["read"],
      grantedToIdentities: [{
        application: {
          id: clientId,
          displayName: "Company HR Chatbot"
        }
      }]
    }, null, 2);
    const getCommand = `https://graph.microsoft.com/v1.0/shares/${encodedUrl}/site`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>⚠️ Action Required: Grant SharePoint Access</h2>
        <p>An HR user attempted to sync resumes from a SharePoint folder, but the system needs permission to access this specific SharePoint site.</p>
        <p><strong>Requested Folder:</strong> <br/> <a href="${folderUrl}">${folderUrl}</a></p>
        
        <h3>How to Approve (One-Time Setup per Site):</h3>
        <p>Because of enterprise security rules, an Admin must grant the bot access via Microsoft Graph.</p>
        
        <h4>Step 1: Find the Site ID</h4>
        <ol>
          <li>Go to <a href="https://developer.microsoft.com/en-us/graph/graph-explorer" target="_blank">Microsoft Graph Explorer</a> and log in as an Admin.</li>
          <li>Make a <strong>GET</strong> request to find the exact Site ID. Copy and paste this exact URL:<br/>
          <code style="background: #eef1f5; padding: 6px; display: block; word-break: break-all; margin-top: 8px; border-radius: 4px;">${getCommand}</code></li>
          <li>Copy the <code>id</code> from the JSON response (it will look like <em>domain.com,xyz123,abc456</em>).</li>
        </ol>

        <h4>Step 2: Grant Access</h4>
        <ol>
          <li>Change the Graph Explorer method to <strong>POST</strong>.</li>
          <li>Set the URL to: <br/><code>https://graph.microsoft.com/v1.0/sites/{PASTE_SITE_ID_HERE}/permissions</code></li>
          <li>Paste the following JSON into the <strong>Request Body</strong> and run it:</li>
        </ol>
        <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">${payload}</pre>
        
        <p>Once you get a 201 Created response, the HR user can retry the sync. You will never have to do this again for this specific site.</p>
      </div>
    `;

    return this.sendEmail(
      to,
      "Action Required: Grant SharePoint Access for HR Chatbot",
      html
    );
  }
}