# Backend Services

This directory contains various backend services and utilities.

## Demo Data Seeder

The `demo-data-seeder.ts` service provides functionality to automatically seed new organizations with sample data to help users get started quickly.

### Features

- **Automatic Seeding**: Automatically seeds demo data when a new organization is created by a first-time user
- **Comprehensive Data**: Creates 2 ideas, 4 projects, 4 issues, 2 waitlists, and 2 roadmaps
- **Smart Detection**: Only seeds data for users who aren't members of other organizations and for empty organizations
- **Realistic Content**: Provides meaningful, realistic sample data that demonstrates the platform's capabilities

### Usage

The service is automatically triggered during organization creation in `apps/web/actions/account/user.ts`. It can also be used manually:

```typescript
import { seedDemoData, shouldSeedDemoData, isUserMemberOfOtherOrgs } from "@workspace/backend/services/demo-data-seeder";

// Check if demo data should be seeded
const needsSeeding = await shouldSeedDemoData(organizationId);
const isNewUser = !(await isUserMemberOfOtherOrgs(userId, organizationId));

if (needsSeeding && isNewUser) {
  await seedDemoData({
    organizationId: "org-id",
    userId: "user-id"
  });
}
```

### Demo Data Structure

#### Ideas (2)
1. **AI-Powered Task Manager** - A validated productivity software idea
2. **Sustainable Food Delivery Platform** - An in-progress food & beverage idea

#### Projects (4)
1. **TaskMaster Pro** - Web app linked to the first idea (in progress)
2. **EcoEats Mobile App** - Mobile app linked to the second idea (planning)
3. **Company Website Redesign** - Standalone web project (in review)
4. **Internal Analytics Dashboard** - Completed standalone project

#### Issues (4)
- Authentication system implementation (high priority, in progress)
- Mobile responsiveness bug fix (medium priority, backlog)
- Restaurant onboarding design (high priority, in review)
- Database query optimization (medium priority, completed)

#### Waitlists (2)
1. **TaskMaster Pro Beta Access** - Public waitlist with position tracking
2. **EcoEats Launch Notification** - Public waitlist for launch notifications

#### Roadmaps (2)
1. **TaskMaster Pro Public Roadmap** - Public roadmap with voting and feedback
2. **EcoEats Development Roadmap** - Public roadmap with feedback only

### Error Handling

The service includes comprehensive error handling and will not prevent organization creation if demo data seeding fails. All errors are logged for debugging purposes.