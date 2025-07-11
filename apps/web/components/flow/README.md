# Flow Editor Component

A modern, fully-featured flow editor for creating and managing visual flow diagrams with React Flow and Convex database integration.

## Features

- **Redesigned UI**: Sleek, modern interface with shadcn/ui components and theming
- **Improved Nodes**: Customizable nodes with proper styling and better handles
- **Smart Connections**: Intelligent connection system with adaptive routing
- **Auto Layout**: Automatic layout organization for cleaner diagrams
- **Responsive Design**: Works well on different screen sizes
- **Sub-flows**: Support for nested flows and navigation
- **Real-time Collaboration**: Changes sync automatically with Convex
- **Theme Support**: Light and dark mode compatibility
- **Performance Optimized**: Efficient rendering and state management

## Components

### Core Components

- **FlowEditor**: The main component that manages the flow editor canvas
- **BaseFlowNode**: Base component for all flow nodes with common styling and behavior
- **StandardNode**: Standard node implementation for most node types
- **ConditionalNode**: Advanced node with branching logic and multiple outputs
- **NodeToolbar**: Floating toolbar for adding new nodes to the canvas
- **NodeDetailsPanel**: Side panel for editing node properties
- **FlowBreadcrumb**: Navigation breadcrumb for sub-flow hierarchy

### Supporting Components

- **MissingFlowDetector**: AI-powered component that suggests missing flow elements
- **SubFlowManager**: Manager for sub-flow creation and navigation
- **LibraryManager**: Manager for node libraries and dependencies
- **ComponentManager**: Manager for custom components used in the flow
- **PromptGenerator**: AI prompt generator for implementation guidance

## Node Types

The flow editor supports the following node types:

| Category     | Node Types                                                                |
| ------------ | ------------------------------------------------------------------------- |
| Flow Control | start, end, conditional, group, stickyNote                                |
| Core         | auth, onboarding, feature, feedback, error, settings, permissions, custom |
| Data         | database, storage, caching, search                                        |
| Integration  | api, payment, notification, analytics, integration, email, sms            |
| Security     | security                                                                  |

## Convex Integration

The flow editor is designed to work seamlessly with Convex for data persistence:

### Data Model

- **Flows**: Main flow and sub-flow metadata
- **FlowNodes**: Node data including position, type, and properties
- **FlowEdges**: Connection data between nodes

### Automatic Synchronization

The editor automatically syncs changes to Convex with:

- Debounced auto-save for performance
- Manual save option for explicit control
- Optimistic UI updates for better UX

## Usage

```tsx
import { FlowEditor } from "@/components/flow";

export default function ProjectFlowPage({ project }) {
  return (
    <div className="h-screen">
      <FlowEditor project={project} />
    </div>
  );
}
```

## Key Interactions

- **Add Node**: Click the "Add Node" button or use the node toolbar
- **Connect Nodes**: Drag from a handle to another node's handle
- **Select Node**: Click on a node to select it and edit properties
- **Delete Node**: Right-click a node or use the delete button in the properties panel
- **Delete Connection**: Click on a connection to remove it
- **Navigate Sub-flows**: Use the breadcrumb or click "Sub-flow" in node footer
- **Organize Layout**: Click the "Auto Layout" button to organize nodes

## Styling

The flow editor uses the shadcn/ui color system for consistent theming:

- Primary color for main actions and highlights
- Muted backgrounds for the canvas
- Semantic colors for different node types
- Consistent sizing and spacing

## Performance Considerations

- Edge updates are batched and debounced
- Node selections optimize rendering
- Canvas operations are throttled
- Large flows use virtualization for performance

## Accessibility

- Keyboard navigation support
- High contrast visual indicators
- Screen reader compatible elements
- Focus management for editing
