"use server";
import { prisma } from "@workspace/backend";

export type WaitlistEntryWithWaitlist = {
  id: string;
  email: string;
  name?: string | null;
  status: string;
  position: number;
  referralCode: string;
  referredBy?: string | null;
  referralCount: number;
  verificationToken?: string | null;
  verifiedAt?: Date | null;
  invitedAt?: Date | null;
  joinedAt?: Date | null;
  ipAddress: string;
  userAgent?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  createdAt: Date;
  updatedAt: Date;
  waitlistId: string;
};

export type IntegrationWithConfig = {
  id: string;
  name: string;
  type: string;
  config: any;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string | null;
};

/**
 * Sync a waitlist entry to the configured email platform
 */
export const syncWaitlistEntryToEmail = async (
  entry: WaitlistEntryWithWaitlist,
  integration: IntegrationWithConfig
) => {
  switch (integration.type) {
    case "RESEND":
      return await syncToResend(entry, integration);
    case "LOOPS":
      return await syncToLoops(entry, integration);
    case "SENDGRID":
      return await syncToSendGrid(entry, integration);
    case "MAILCHIMP":
      return await syncToMailchimp(entry, integration);
    case "CONVERTKIT":
      return await syncToConvertKit(entry, integration);
    default:
      throw new Error(`Unsupported integration type: ${integration.type}`);
  }
};

/**
 * Sync to Resend
 */
async function syncToResend(entry: WaitlistEntryWithWaitlist, integration: IntegrationWithConfig) {
  const { apiKey } = integration.config;
  
  if (!apiKey) {
    throw new Error("Resend API key not configured");
  }

  try {
    const response = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: entry.email,
        firstName: entry.name?.split(" ")[0] || "",
        lastName: entry.name?.split(" ").slice(1).join(" ") || "",
        unsubscribed: false,
        audienceId: integration.config.audienceId,
        metadata: {
          waitlistId: entry.waitlistId,
          position: entry.position,
          referralCode: entry.referralCode,
          referredBy: entry.referredBy,
          status: entry.status,
          utmSource: entry.utmSource,
          utmMedium: entry.utmMedium,
          utmCampaign: entry.utmCampaign,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Resend sync error:", error);
    throw error;
  }
}

/**
 * Sync to Loops
 */
async function syncToLoops(entry: WaitlistEntryWithWaitlist, integration: IntegrationWithConfig) {
  const { apiKey } = integration.config;
  
  if (!apiKey) {
    throw new Error("Loops API key not configured");
  }

  try {
    const response = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: entry.email,
        firstName: entry.name?.split(" ")[0] || "",
        lastName: entry.name?.split(" ").slice(1).join(" ") || "",
        subscribed: true,
        userProperties: {
          waitlistId: entry.waitlistId,
          position: entry.position,
          referralCode: entry.referralCode,
          referredBy: entry.referredBy,
          status: entry.status,
          utmSource: entry.utmSource,
          utmMedium: entry.utmMedium,
          utmCampaign: entry.utmCampaign,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Loops API error: ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Loops sync error:", error);
    throw error;
  }
}

/**
 * Sync to SendGrid
 */
async function syncToSendGrid(entry: WaitlistEntryWithWaitlist, integration: IntegrationWithConfig) {
  const { apiKey, listId } = integration.config;
  
  if (!apiKey) {
    throw new Error("SendGrid API key not configured");
  }

  if (!listId) {
    throw new Error("SendGrid list ID not configured");
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contacts: [
          {
            email: entry.email,
            first_name: entry.name?.split(" ")[0] || "",
            last_name: entry.name?.split(" ").slice(1).join(" ") || "",
            custom_fields: {
              waitlist_id: entry.waitlistId,
              position: entry.position,
              referral_code: entry.referralCode,
              referred_by: entry.referredBy,
              status: entry.status,
              utm_source: entry.utmSource,
              utm_medium: entry.utmMedium,
              utm_campaign: entry.utmCampaign,
            },
          },
        ],
        list_ids: [listId],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error("SendGrid sync error:", error);
    throw error;
  }
}

/**
 * Sync to Mailchimp
 */
async function syncToMailchimp(entry: WaitlistEntryWithWaitlist, integration: IntegrationWithConfig) {
  const { apiKey, listId } = integration.config;
  
  if (!apiKey) {
    throw new Error("Mailchimp API key not configured");
  }

  if (!listId) {
    throw new Error("Mailchimp list ID not configured");
  }

  // Extract server prefix from API key
  const serverPrefix = apiKey.split("-").pop();
  if (!serverPrefix) {
    throw new Error("Invalid Mailchimp API key format");
  }

  try {
    const response = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: entry.email,
        status: "subscribed",
        merge_fields: {
          FNAME: entry.name?.split(" ")[0] || "",
          LNAME: entry.name?.split(" ").slice(1).join(" ") || "",
          WAITLIST_ID: entry.waitlistId,
          POSITION: entry.position,
          REFERRAL_CODE: entry.referralCode,
          REFERRED_BY: entry.referredBy,
          STATUS: entry.status,
          UTM_SOURCE: entry.utmSource,
          UTM_MEDIUM: entry.utmMedium,
          UTM_CAMPAIGN: entry.utmCampaign,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailchimp API error: ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Mailchimp sync error:", error);
    throw error;
  }
}

/**
 * Sync to ConvertKit
 */
async function syncToConvertKit(entry: WaitlistEntryWithWaitlist, integration: IntegrationWithConfig) {
  const { apiKey, listId } = integration.config;
  
  if (!apiKey) {
    throw new Error("ConvertKit API key not configured");
  }

  if (!listId) {
    throw new Error("ConvertKit form ID not configured");
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${listId}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        email: entry.email,
        first_name: entry.name?.split(" ")[0] || "",
        fields: {
          last_name: entry.name?.split(" ").slice(1).join(" ") || "",
          waitlist_id: entry.waitlistId,
          position: entry.position,
          referral_code: entry.referralCode,
          referred_by: entry.referredBy,
          status: entry.status,
          utm_source: entry.utmSource,
          utm_medium: entry.utmMedium,
          utm_campaign: entry.utmCampaign,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ConvertKit API error: ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error("ConvertKit sync error:", error);
    throw error;
  }
} 