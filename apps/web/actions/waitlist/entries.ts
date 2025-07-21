"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { syncWaitlistEntryToEmail } from "./email-sync";
import { getIntegrationUsage } from "../integration/usage";

/**
 * Create a new waitlist entry
 */
export const createWaitlistEntry = async (data: { waitlistId: string; email: string; status: string; position: number; referralCode: string; name?: string; referredBy?: string; referralCount?: number; verificationToken?: string; verifiedAt?: Date; invitedAt?: Date; joinedAt?: Date; ipAddress: string; userAgent?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }) => {
  const { org } = await getSession();
  try {
        // Ensure the waitlist belongs to the org
    const waitlist = await prisma.waitlist.findFirst({
      where: { id: data.waitlistId, organizationId: org }
    });
    if (!waitlist) return { success: false, error: 'Waitlist not found or not in your organization' };
    
    const entry = await prisma.waitlistEntry.create({ data });
    
    // Check for email sync integration usage
    const emailSyncUsage = await getIntegrationUsage("waitlist", data.waitlistId, "email_sync");
    if (emailSyncUsage.success && emailSyncUsage.data && emailSyncUsage.data.isActive) {
      try {
        await syncWaitlistEntryToEmail(entry, emailSyncUsage.data.integration);
      } catch (syncError) {
        console.error('Email sync failed:', syncError);
        // Don't fail the entry creation if sync fails
      }
    }

    return { success: true, data: entry };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get a waitlist entry by ID (scoped to org via parent waitlist)
 */
export const getWaitlistEntry = async (id: string) => {
  const { org } = await getSession();
  try {
    const entry = await prisma.waitlistEntry.findFirst({ where: { id, waitlist: { organizationId: org } } });
    return { success: true, data: entry };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * List all entries for a waitlist (scoped to org)
 */
export const getAllWaitlistEntries = async (waitlistId: string) => {
  const { org } = await getSession();
  try {
    // Ensure the waitlist belongs to the org
    const waitlist = await prisma.waitlist.findFirst({ where: { id: waitlistId, organizationId: org } });
    if (!waitlist) return { success: false, error: 'Waitlist not found or not in your organization' };
    const entries = await prisma.waitlistEntry.findMany({ where: { waitlistId } });
    return { success: true, data: entries };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Update a waitlist entry (scoped to org via parent waitlist)
 */
export const updateWaitlistEntry = async (id: string, data: Partial<{ email?: string; status?: string; position?: number; referralCode?: string; name?: string; referredBy?: string; referralCount?: number; verificationToken?: string; verifiedAt?: Date; invitedAt?: Date; joinedAt?: Date; ipAddress?: string; userAgent?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }>) => {
  const { org } = await getSession();
  try {
    // Ensure the entry belongs to a waitlist in the org
    const entry = await prisma.waitlistEntry.findFirst({ where: { id, waitlist: { organizationId: org } } });
    if (!entry) return { success: false, error: 'Entry not found or not in your organization' };
    const updated = await prisma.waitlistEntry.update({ where: { id }, data });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete a waitlist entry (scoped to org via parent waitlist)
 */
export const deleteWaitlistEntry = async (id: string) => {
  const { org } = await getSession();
  try {
    // Ensure the entry belongs to a waitlist in the org
    const entry = await prisma.waitlistEntry.findFirst({ where: { id, waitlist: { organizationId: org } } });
    if (!entry) return { success: false, error: 'Entry not found or not in your organization' };
    await prisma.waitlistEntry.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Verify a waitlist entry by verification token
 */
export const verifyWaitlistEmail = async (verificationToken: string) => {
  const { org } = await getSession();
  try {
    const entry = await prisma.waitlistEntry.findFirst({
      where: { verificationToken, waitlist: { organizationId: org } },
    });
    if (!entry) return { success: false, error: 'Invalid or expired verification token' };
    if (entry.verifiedAt) return { success: false, error: 'Email already verified' };
    const updated = await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { verifiedAt: new Date() },
    });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error };
  }
}; 