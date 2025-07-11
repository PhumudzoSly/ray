// Define types for template categories and tools
export type TemplateCategory =
  | "implementation"
  | "testing"
  | "documentation"
  | "debugging"
  | "optimization"
  | "deployment";
export type TargetTool =
  | "cursor"
  | "bolt"
  | "v0"
  | "claude"
  | "chatgpt"
  | "copilot"
  | "universal";

// Default prompt templates
export const DEFAULT_TEMPLATES: Array<{
  name: string;
  description: string;
  category: TemplateCategory;
  targetTool: TargetTool;
  template: string;
  variables: string[];
}> = [
  {
    name: "Cursor Implementation",
    description: "Comprehensive implementation prompt for Cursor AI",
    category: "implementation",
    targetTool: "cursor",
    template: `# Implement {{featureName}} Feature

## Project Context
- **Project**: {{projectName}}
- **Platform**: {{platform}}
- **Tech Stack**: {{techStack}}

## Feature Requirements
{{prdContent}}

## Libraries & Dependencies
{{libraryList}}

## Implementation Instructions

### 1. File Structure
Create the following file structure:
\`\`\`
{{fileStructure}}
\`\`\`

### 2. Core Implementation
- Use TypeScript for all files
- Follow the existing project patterns
- Implement proper error handling
- Add loading states where appropriate

### 3. Integration Points
{{integrationPoints}}

### 4. Testing Requirements
- Write unit tests for core functionality
- Add integration tests for user flows
- Ensure accessibility compliance

### 5. Documentation
- Add JSDoc comments for all public functions
- Update README if needed
- Document any new environment variables

## Acceptance Criteria
{{acceptanceCriteria}}

## Additional Notes
- Follow the project's coding standards
- Ensure responsive design for all screen sizes
- Optimize for performance and SEO
- Use the existing design system components`,
    variables: [
      "featureName",
      "projectName",
      "platform",
      "techStack",
      "prdContent",
      "libraryList",
      "fileStructure",
      "integrationPoints",
      "acceptanceCriteria",
    ],
  },
  {
    name: "Bolt.new Implementation",
    description: "Optimized prompt for Bolt.new with file-by-file approach",
    category: "implementation",
    targetTool: "bolt",
    template: `Build {{featureName}} for {{projectName}}

## Requirements
{{prdContent}}

## Tech Stack
{{techStack}}

## Libraries to Use
{{libraryList}}

## Implementation Plan

### Phase 1: Core Components
Create the main components with proper TypeScript interfaces and error handling.

### Phase 2: Integration
Connect with existing systems: {{integrationPoints}}

### Phase 3: Styling & UX
Apply consistent styling using the project's design system.

### Phase 4: Testing & Polish
Add proper validation, loading states, and error boundaries.

## File Structure
{{fileStructure}}

## Key Requirements
- Use TypeScript throughout
- Follow existing patterns
- Implement proper error handling
- Add loading states
- Ensure accessibility
- Make it responsive

Start with the core component files and work outward to integration.`,
    variables: [
      "featureName",
      "projectName",
      "prdContent",
      "techStack",
      "libraryList",
      "integrationPoints",
      "fileStructure",
    ],
  },
  {
    name: "v0 Component",
    description: "Component-focused prompt for v0.dev",
    category: "implementation",
    targetTool: "v0",
    template: `Create a {{featureName}} component for a {{platform}} application.

## Component Requirements
{{prdContent}}

## Design System
- Use shadcn/ui components
- Follow Tailwind CSS best practices
- Ensure responsive design
- Include proper accessibility attributes

## Functionality
- TypeScript interfaces for all props
- Proper state management
- Error handling and loading states
- Form validation where applicable

## Libraries Available
{{libraryList}}

## Integration
This component will integrate with: {{integrationPoints}}

Make it production-ready with proper error boundaries and loading states.`,
    variables: [
      "featureName",
      "platform",
      "prdContent",
      "libraryList",
      "integrationPoints",
    ],
  },
  {
    name: "Claude Implementation",
    description: "Detailed implementation guide for Claude",
    category: "implementation",
    targetTool: "claude",
    template: `# {{featureName}} Implementation Guide

I need to implement the {{featureName}} feature for {{projectName}}. Here are the complete requirements:

## Project Context
- **Name**: {{projectName}}
- **Platform**: {{platform}}
- **Tech Stack**: {{techStack}}

## Feature Specification
{{prdContent}}

## Available Libraries
{{libraryList}}

## Architecture Requirements
1. **Component Structure**: Create modular, reusable components
2. **State Management**: Use appropriate state management patterns
3. **Error Handling**: Implement comprehensive error boundaries
4. **Performance**: Optimize for loading speed and user experience
5. **Accessibility**: Ensure WCAG 2.1 AA compliance
6. **Testing**: Include unit and integration tests

## Integration Points
{{integrationPoints}}

## File Organization
{{fileStructure}}

## Acceptance Criteria
{{acceptanceCriteria}}

Please provide a complete implementation with:
- All necessary files and their complete code
- Proper TypeScript types and interfaces
- Error handling and loading states
- Responsive design implementation
- Accessibility features
- Basic tests

Focus on production-ready code that follows best practices.`,
    variables: [
      "featureName",
      "projectName",
      "platform",
      "techStack",
      "prdContent",
      "libraryList",
      "integrationPoints",
      "fileStructure",
      "acceptanceCriteria",
    ],
  },
  {
    name: "Testing Suite",
    description: "Comprehensive testing prompt",
    category: "testing",
    targetTool: "universal",
    template: `# Testing Suite for {{featureName}}

## Feature Overview
{{prdContent}}

## Testing Requirements

### 1. Unit Tests
- Test all component logic
- Test utility functions
- Test custom hooks
- Mock external dependencies

### 2. Integration Tests
- Test component interactions
- Test API integrations
- Test user workflows

### 3. Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- Focus management

### 4. Performance Tests
- Loading time benchmarks
- Memory usage monitoring
- Bundle size analysis

## Test Framework
- **Testing Library**: {{testingLibrary}}
- **Test Runner**: {{testRunner}}
- **Mocking**: {{mockingLibrary}}

## Coverage Requirements
- Minimum 80% code coverage
- 100% coverage for critical paths
- All error scenarios tested

## Test Files Structure
{{testFileStructure}}

Create comprehensive tests that ensure the feature works correctly across all scenarios.`,
    variables: [
      "featureName",
      "prdContent",
      "testingLibrary",
      "testRunner",
      "mockingLibrary",
      "testFileStructure",
    ],
  },
  {
    name: "Documentation Generator",
    description: "Generate comprehensive documentation",
    category: "documentation",
    targetTool: "universal",
    template: `# {{featureName}} Documentation

## Overview
{{prdContent}}

## Installation & Setup
{{installationSteps}}

## API Reference
Document all public interfaces, props, and methods.

## Usage Examples
Provide practical examples for common use cases.

## Configuration
Detail all configuration options and environment variables.

## Troubleshooting
Common issues and their solutions.

## Contributing
Guidelines for contributing to this feature.

## Libraries Used
{{libraryList}}

Create comprehensive documentation that helps developers understand and use this feature effectively.`,
    variables: [
      "featureName",
      "prdContent",
      "installationSteps",
      "libraryList",
    ],
  },
];
