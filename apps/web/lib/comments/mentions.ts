/**
 * Utility functions for processing user mentions in comments
 * Handles extraction, resolution, and insertion of user mentions
 */

/**
 * Extracts mentioned user IDs from comment content
 * @param content - Comment content with user:{userId} format mentions
 * @returns Array of unique user IDs that were mentioned
 */
export function extractMentionedUserIds(content: string): string[] {
  const mentionRegex = /user:\{([^}]+)\}/g;
  const userIds: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    userIds.push(match[1]);
  }

  return [...new Set(userIds)]; // Remove duplicates
}

/**
 * Resolves comment content by replacing user:{userId} with @UserName
 * @param content - Raw comment content with user:{userId} mentions
 * @param users - Array of user objects with id and name
 * @returns Resolved content with @UserName mentions
 */
export function resolveCommentContent(
  content: string,
  users: { id: string; name: string }[]
): string {
  const userMap = new Map(users.map((user) => [user.id, user.name]));

  return content.replace(/user:\{([^}]+)\}/g, (match, userId) => {
    const userName = userMap.get(userId);
    return userName ? `@${userName}` : match; // Fallback to original if user not found
  });
}

/**
 * Inserts a mention at the specified cursor position
 * @param content - Current comment content
 * @param cursorPosition - Current cursor position in the content
 * @param user - User object with id and name to mention
 * @returns Object with updated content and new cursor position
 */
export function insertMention(
  content: string,
  cursorPosition: number,
  user: { id: string; name: string }
): { content: string; newCursorPosition: number } {
  const mention = `user:{${user.id}}`;
  const newContent =
    content.slice(0, cursorPosition) + mention + content.slice(cursorPosition);

  return {
    content: newContent,
    newCursorPosition: cursorPosition + mention.length,
  };
}
