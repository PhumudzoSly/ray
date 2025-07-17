"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

// Get all messages for a conversation
export const getMessages = async (conversationId: string) => {
    const { org } = await getSession();
    return prisma.agentMessage.findMany({
        where: { conversationId, organizationId: org },
        orderBy: { createdAt: "asc" },
    });
};

// Get a single conversation by ID
export const getConversation = async (conversationId: string) => {
    const { org } = await getSession();
    return prisma.agentConversation.findFirst({
        where: { id: conversationId, organizationId: org },
    });
};

// Create a new conversation
export const createConversation = async ({
    title,
    userId,
    organizationId,
    model,
}: {
    title: string;
    userId: string;
    organizationId: string;
    model: string;
}) => {
    const conversation = await prisma.agentConversation.create({
        data: {
            title,
            userId,
            organizationId,
            model,
        },
    });
    return conversation.id;
};

// Stub for generating an AI response (to be implemented)
export const generateResponse = async ({
    conversationId,
    userMessage,
    userId,
    organizationId,
}: {
    conversationId: string;
    userMessage: string;
    userId: string;
    organizationId: string;
}) => {
    // TODO: Implement AI response logic
    // For now, just create a message as a placeholder
    await prisma.agentMessage.create({
        data: {
            conversationId,
            organizationId,
            userId,
            content: `AI response to: ${userMessage}`,
            role: "assistant",
        },
    });
    return { success: true };
};

// Get all conversations for a user in an org
export const getConversations = async ({ userId }: { userId: string }) => {
    const { org } = await getSession();
    return prisma.agentConversation.findMany({
        where: { userId, organizationId: org },
        orderBy: { createdAt: "desc" },
    });
};

// Delete a conversation by ID
export const deleteConversation = async ({ conversationId }: { conversationId: string }) => {
    const { org } = await getSession();
    // Delete all messages first (if needed)
    await prisma.agentMessage.deleteMany({ where: { conversationId, organizationId: org } });
    // Delete the conversation
    await prisma.agentConversation.delete({ where: { id: conversationId, organizationId: org } });
    return { success: true };
};

// Update conversation title
export const updateConversationTitle = async ({ conversationId, title }: { conversationId: string, title: string }) => {
    const { org } = await getSession();
    await prisma.agentConversation.update({
        where: { id: conversationId, organizationId: org },
        data: { title },
    });
    return { success: true };
}; 