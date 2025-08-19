# Implementation Plan

- [x] 1. Set up database models and migrations
  - Create Prisma schema for Comment, CommentAttachment, and CommentReaction models
  - Add necessary relations to existing User and Organization models
  - Generate and run database migrations
  - _Requirements: 1.1, 6.1, 6.2_

- [ ] 2. Create mention processing utilities
  - [x] 2.1 Implement mention extraction function
    - Create `extractMentionedUserIds()` function to parse user:{id} format

    - Write unit tests for various mention patterns and edge cases
    - _Requirements: 2.2, 2.4_

  - [x] 2.2 Implement mention resolution function
    - Create `resolveCommentContent()` function to replace user:{id} with @Name
    - Handle cases where users are not found or inactive
    - Write unit tests for user resolution scenarios
    - _Requirements: 2.4, 3.3_

  - [x] 2.3 Implement mention insertion helper
    - Create `insertMention()` function for editor cursor positioning
    - Handle cursor position updates after mention insertion
    - Write unit tests for cursor positioning logic
    - _Requirements: 2.1, 2.2_

- [x] 3. Create core comment server actions
  - [x] 3.1 Implement createComment server action
    - Create comment creation with entity association (project/issue/feature/milestone)
    - Extract mentioned user IDs and store in mentionedUserIds array
    - Implement proper organization and permission checks
    - Write unit tests for comment creation scenarios
    - _Requirements: 1.1, 1.3, 1.4, 6.3_

  - [x] 3.2 Implement getEntityComments server action
    - Query comments for specific entity with proper organization scoping
    - Include author information and resolve mentioned users
    - Implement pagination for large comment threads
    - Write unit tests for comment retrieval and user resolution
    - _Requirements: 1.1, 3.1, 3.2, 5.3_

  - [x] 3.3 Implement updateComment server action
    - Allow comment authors to edit their own comments
    - Update mentionedUserIds array when mentions change
    - Set isEdited flag and editedAt timestamp
    - Write unit tests for edit permissions and mention updates
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.4 Implement deleteComment server action
    - Soft delete comments (set isDeleted flag)
    - Allow comment authors and admins to delete comments
    - Handle cascade deletion of attachments and reactions
    - Write unit tests for deletion permissions and cleanup
    - _Requirements: 4.1, 4.4, 8.3_

- [x] 4. Create user resolution server actions
  - [x] 4.1 Implement getOrganizationMembers server action
    - Query organization members for mention autocomplete
    - Return user ID, name, image, and email for search
    - Implement proper organization scoping and permissions
    - Write unit tests for member retrieval and filtering
    - _Requirements: 2.1, 2.2, 6.3_

  - [ ] 4.2 Implement resolveUsers server action
    - Batch resolve user information from user IDs

    - Handle inactive or deleted users gracefully
    - Implement caching for frequently accessed users
    - Write unit tests for batch user resolution
    - _Requirements: 2.4, 3.3, 8.3_

- [x] 5. Create file attachment server actions
  - [x] 5.1 Implement createCommentAttachment server action
    - Leverage existing Asset creation patterns from project/assets.ts
    - Create CommentAttachment records linked to uploaded files
    - Use existing UploadThing integration for file storage
    - Write unit tests for attachment creation and validation
    - _Requirements: 1.1, 1.4, 6.3_

  - [x] 5.2 Implement deleteCommentAttachment server action
    - Remove CommentAttachment records and associated Asset files
    - Check permissions (only uploader or admin can delete)
    - Use existing asset deletion patterns for cleanup
    - Write unit tests for attachment deletion and permissions
    - _Requirements: 4.1, 4.4, 8.3_

- [x] 6. Create reaction server actions
  - [x] 6.1 Implement addCommentReaction server action
    - Add emoji reaction to comment with duplicate prevention
    - Use unique constraint to prevent duplicate reactions
    - Update reaction counts efficiently
    - Write unit tests for reaction addition and constraints
    - _Requirements: 1.1, 1.4, 6.3_

  - [x] 6.2 Implement removeCommentReaction server action
    - Remove user's reaction from comment
    - Update reaction counts and handle empty reactions
    - Implement proper permission checks
    - Write unit tests for reaction removal and count updates
    - _Requirements: 1.1, 1.4, 6.3_

- [x] 7. Create basic comment UI components
  - [x] 7.1 Create CommentItem component
    - Display comment content with resolved mentions
    - Show author information, timestamps, and edit indicators
    - Include edit/delete buttons for comment owners
    - Style mentions with proper highlighting and hover effects
    - Write component tests for rendering and interactions
    - _Requirements: 3.1, 3.2, 3.3, 4.1_

  - [x] 7.2 Create CommentEditor component
    - Implement text input with mention autocomplete
    - Show @ trigger for user search and selection
    - Handle mention insertion at cursor position
    - Include basic formatting and character limits
    - Write component tests for mention functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 7.3 Create CommentThread component
    - Display list of comments for an entity
    - Include comment editor for new comments
    - Handle loading states and error messages
    - Implement basic pagination for large threads
    - Write component tests for thread display and interactions
    - _Requirements: 1.1, 5.1, 5.2, 5.3_

- [x] 8. Add file attachment support to UI
  - [x] 8.1 Enhance CommentEditor with UploadThing integration
    - Integrate existing UploadThing components for file upload
    - Add drag-and-drop functionality using UploadThing patterns
    - Show upload progress and file previews with existing UI components
    - Handle multiple file uploads with proper validation
    - Write component tests for UploadThing integration
    - _Requirements: 1.1, 1.4, 5.3_

  - [x] 8.2 Add file display to CommentItem using Asset patterns
    - Show attached files using existing Asset display components
    - Leverage existing thumbnail and preview functionality
    - Add download links using existing asset download patterns
    - Handle different file types with existing Asset styling
    - Write component tests for asset display integration
    - _Requirements: 3.1, 3.2, 5.3_

- [x] 9. Add emoji reaction support to UI
  - [x] 9.1 Create CommentReactions component
    - Display reaction counts and emoji buttons
    - Show user lists on hover with reaction details
    - Implement reaction toggle functionality
    - Style reactions with proper spacing and animations
    - Write component tests for reaction display and interactions
    - _Requirements: 1.1, 3.1, 3.2_

  - [x] 9.2 Add reaction picker to CommentItem
    - Create emoji picker popup with common reactions
    - Implement search functionality for emoji selection
    - Handle reaction addition and removal with optimistic updates
    - Style picker with proper positioning and animations
    - Write component tests for emoji picker functionality
    - _Requirements: 1.1, 3.1, 3.2_

- [x] 10. Integrate comments into entity pages
  - [x] 10.1 Add CommentThread to project pages
    - Integrate comment thread component into project detail pages
    - Pass proper entity type and ID to comment components
    - Handle loading states and error boundaries
    - Test comment functionality within project context
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 10.2 Add CommentThread to issue pages
    - Integrate comment thread component into issue detail pages
    - Ensure proper permission checks for issue access
    - Handle issue-specific comment notifications
    - Test comment functionality within issue context
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 10.3 Add CommentThread to feature pages
    - Integrate comment thread component into feature detail pages
    - Handle feature-specific comment permissions
    - Test comment functionality within feature context
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 10.4 Add CommentThread to milestone pages
    - Integrate comment thread component into milestone detail pages
    - Handle milestone-specific comment permissions
    - Test comment functionality within milestone context
    - _Requirements: 1.1, 1.3, 1.4_

- [x] 11. Implement real-time comment updates
  - [x] 11.1 Set up WebRTC integration for comments
    - Create comment-specific WebRTC rooms using existing patterns
    - Implement real-time comment broadcasting
    - Handle connection management and reconnection logic
    - Write integration tests for real-time functionality
    - _Requirements: 1.5, 6.1, 6.2_

  - [x] 11.2 Add real-time reaction updates
    - Broadcast reaction changes to all connected users
    - Update reaction counts in real-time without page refresh
    - Handle optimistic updates with conflict resolution
    - Write integration tests for real-time reactions
    - _Requirements: 1.5, 6.1, 6.2_

  - [x] 11.3 Add real-time typing indicators
    - Show when users are typing comments
    - Display typing indicators with user names
    - Handle typing timeout and cleanup
    - Write integration tests for typing indicators
    - _Requirements: 1.5, 6.1, 6.2_

- [ ] 12. Implement notification system
  - [x] 12.1 Create mention notification system
    - Send notifications when users are mentioned in comments
    - Create notification records in database
    - Implement email notifications for offline users
    - Write unit tests for mention notification logic
    - _Requirements: 2.5, 7.1, 7.2, 7.4_

  - [x] 12.2 Create follow notification system
    - Auto-follow entities when users comment on them
    - Send notifications for new comments on followed entities
    - Implement notification preferences and unsubscribe options
    - Write unit tests for follow notification logic
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

  - [x] 12.3 Add in-app notification display
    - Create notification UI components for comment mentions
    - Show unread notification counts and indicators
    - Implement notification marking as read
    - Write component tests for notification display
    - _Requirements: 7.1, 7.4, 7.5_

- [x] 13. Add comprehensive error handling
  - [x] 13.1 Implement server action error handling
    - Add proper error handling to all comment server actions
    - Return user-friendly error messages for common scenarios
    - Implement retry logic for transient failures
    - Write unit tests for error scenarios and recovery
    - _Requirements: 6.3, 8.1, 8.2, 8.3_

  - [x] 13.2 Add UI error boundaries and states
    - Create error boundaries for comment components
    - Show appropriate error messages for failed operations
    - Implement retry mechanisms for failed requests
    - Write component tests for error handling scenarios
    - _Requirements: 5.2, 8.1, 8.2, 8.3_

- [x] 14. Optimize performance and add caching
  - [x] 14.1 Implement comment pagination
    - Add pagination to comment threads for performance
    - Implement infinite scroll or load more functionality
    - Cache comment data to reduce database queries
    - Write performance tests for large comment threads
    - _Requirements: 5.3, 8.4, 8.5_

  - [x] 14.2 Add user resolution caching
    - Cache resolved user data to reduce repeated queries
    - Implement cache invalidation for user updates
    - Optimize batch user resolution queries
    - Write performance tests for user resolution
    - _Requirements: 3.3, 8.4, 8.5_

- [ ] 15. Add comprehensive testing
  - [ ] 15.1 Write integration tests for comment workflows
    - Test complete comment creation, editing, and deletion flows
    - Test file upload and attachment workflows
    - Test reaction addition and removal workflows
    - Test mention notification workflows
    - _Requirements: 8.6, 8.7, 8.8_

  - [ ] 15.2 Write end-to-end tests for comment system
    - Test comment functionality across all entity types
    - Test real-time updates with multiple users
    - Test notification delivery and display
    - Test error scenarios and recovery
    - _Requirements: 8.6, 8.7, 8.8_

- [x] 16. Final integration and polish
  - [x] 16.1 Polish comment UI and interactions
    - Refine comment styling and animations
    - Improve accessibility with proper ARIA labels
    - Optimize mobile responsiveness
    - Conduct user experience testing
    - _Requirements: 3.1, 3.2, 5.4, 5.5_

  - [x] 16.2 Performance optimization and monitoring
    - Optimize database queries with proper indexing
    - Monitor real-time performance and connection stability
    - Implement performance metrics and logging
    - Conduct load testing with multiple concurrent users
    - _Requirements: 8.4, 8.5, 8.6_
