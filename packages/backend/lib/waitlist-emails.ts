import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface WaitlistEntry {
  email: string;
  name?: string;
  position: number;
  referralCode: string;
  verificationToken?: string;
}

interface WaitlistData {
  name: string;
  description: string;
  slug: string;
  project: {
    name: string;
  };
}

export async function sendWaitlistWelcomeEmail(
  entry: WaitlistEntry,
  waitlist: WaitlistData
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/waitlist/join?token=${entry.verificationToken}`;
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wl/${waitlist.slug}?ref=${entry.referralCode}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ${waitlist.name} Waitlist</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px; }
          .position-badge { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 50px; padding: 15px 25px; text-align: center; margin: 20px 0; }
          .position-number { font-size: 2.5em; font-weight: bold; color: #495057; margin: 0; }
          .position-text { color: #6c757d; margin: 5px 0 0 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .referral-box { background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .referral-url { background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
          .footer { text-align: center; color: #6c757d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 You're on the waitlist!</h1>
          <p>Welcome to ${waitlist.name} for ${waitlist.project.name}</p>
        </div>
        
        <div class="content">
          <div class="position-badge">
            <div class="position-number">#${entry.position}</div>
            <div class="position-text">Your current position</div>
          </div>
          
          <p>Hi ${entry.name || "there"},</p>
          
          <p>Thank you for joining the waitlist for <strong>${waitlist.name}</strong>! You're currently position <strong>#${entry.position}</strong> in line.</p>
          
          <p><strong>First, please verify your email address:</strong></p>
          <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
          
          <div class="referral-box">
            <h3>🚀 Want to move up faster?</h3>
            <p>Share your unique referral link with friends. For every person who joins through your link, you'll move up one position!</p>
            <div class="referral-url">${referralUrl}</div>
            <p><small>Each successful referral moves you up one spot in the waitlist.</small></p>
          </div>
          
          <p>We'll keep you updated on your progress and let you know when it's your turn to get early access.</p>
          
          <p>Thanks for your interest in ${waitlist.project.name}!</p>
        </div>
        
        <div class="footer">
          <p>This email was sent because you joined the waitlist for ${waitlist.name}.</p>
          <p>If you didn't sign up for this waitlist, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `${waitlist.project.name} <noreply@${process.env.RESEND_DOMAIN || "rayai.dev"}>`,
      to: entry.email,
      subject: `Welcome to ${waitlist.name} waitlist - You're #${entry.position}!`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send waitlist welcome email:", error);
    throw error;
  }
}

export async function sendWaitlistInviteEmail(
  entry: WaitlistEntry,
  waitlist: WaitlistData
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>You're Invited! ${waitlist.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px; }
          .invite-badge { background: #d4edda; border: 2px solid #c3e6cb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold; }
          .stats { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6c757d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎊 You're invited!</h1>
          <p>Your wait is over for ${waitlist.name}</p>
        </div>
        
        <div class="content">
          <div class="invite-badge">
            <h2>🎉 Congratulations!</h2>
            <p>You've been selected for early access</p>
          </div>
          
          <p>Hi ${entry.name || "there"},</p>
          
          <p>Great news! You've been invited to get early access to <strong>${waitlist.project.name}</strong>.</p>
          
          <p>You were position <strong>#${entry.position}</strong> on the waitlist, and thanks to your patience (and ${entry.referralCode ? "awesome referrals" : "early signup"}), it's now your turn!</p>
          
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/wl/${waitlist.slug}?invited=${entry.referralCode}" class="button">Get Early Access Now</a></p>
          
          <div class="stats">
            <h3>Your Waitlist Journey:</h3>
            <p>• Position: #${entry.position}</p>
            <p>• Referrals: ${entry.referralCode ? "Active referrer" : "Early supporter"}</p>
            <p>• Status: Ready for early access! 🚀</p>
          </div>
          
          <p>Thank you for being an early supporter of ${waitlist.project.name}. We can't wait to see what you build with it!</p>
          
          <p>Welcome aboard!</p>
        </div>
        
        <div class="footer">
          <p>This invitation is for ${entry.email} and expires in 7 days.</p>
          <p>If you have any questions, feel free to reach out to our team.</p>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `${waitlist.project.name} <noreply@${process.env.RESEND_DOMAIN || "rayai.dev"}>`,
      to: entry.email,
      subject: `🎉 You're invited! Early access to ${waitlist.name}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send waitlist invite email:", error);
    throw error;
  }
}

export async function sendEmailVerificationConfirmation(
  entry: WaitlistEntry,
  waitlist: WaitlistData
) {
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wl/${waitlist.slug}?ref=${entry.referralCode}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verified - ${waitlist.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px; }
          .verified-badge { background: #d4edda; border: 2px solid #c3e6cb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .position-number { font-size: 2em; font-weight: bold; color: #28a745; }
          .referral-box { background: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .referral-url { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
          .footer { text-align: center; color: #6c757d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Email Verified!</h1>
          <p>You're officially on the ${waitlist.name} waitlist</p>
        </div>
        
        <div class="content">
          <div class="verified-badge">
            <h2>🎉 All set!</h2>
            <p>Your email has been verified</p>
            <div class="position-number">#${entry.position}</div>
            <p>Current position in line</p>
          </div>
          
          <p>Hi ${entry.name || "there"},</p>
          
          <p>Perfect! Your email has been verified and you're now officially on the waitlist for <strong>${waitlist.name}</strong>.</p>
          
          <div class="referral-box">
            <h3>🚀 Speed up your access</h3>
            <p>Share your unique referral link to move up the waitlist faster:</p>
            <div class="referral-url">${referralUrl}</div>
            <p><small>Each person who joins through your link moves you up one position!</small></p>
          </div>
          
          <p>We'll email you when it's your turn for early access. In the meantime, follow our progress and get updates!</p>
          
          <p>Thanks for joining the ${waitlist.project.name} community!</p>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you verified your email for ${waitlist.name}.</p>
          <p>We'll only email you with important waitlist updates.</p>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `${waitlist.project.name} <noreply@${process.env.RESEND_DOMAIN || "rayai.dev"}>`,
      to: entry.email,
      subject: `✅ Email verified - You're on the ${waitlist.name} waitlist!`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send email verification confirmation:", error);
    throw error;
  }
}
