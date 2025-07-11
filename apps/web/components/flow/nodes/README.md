# Flow Node Components

This directory contains the new modular node structure for the flow editor.

## Structure

- `BaseFlowNode.tsx` - Base component with common functionality
- `StandardNode.tsx` - Standard node for most use cases
- `ConditionalNode.tsx` - Advanced conditional node with custom conditions
- `index.ts` - Exports all node types and provides the node type map

## Node Architecture

### FlowNodeRouter

The main entry point for all flow nodes. ReactFlow uses the `flowNode` type for all nodes, and this router component examines the `data.type` property to determine which specialized component to render.

## Node Types

### StandardNode

Used for most regular flow nodes like:

- `auth`, `onboarding`, `feature`, `feedback`, `error`
- `settings`, `permissions`, `api`, `payment`, `notification`
- `analytics`, `integration`, `database`, `security`, `storage`
- `caching`, `search`, `email`, `sms`, `group`
- `custom`, `stickyNote`

### ConditionalNode

A powerful branching node that allows:

- **Custom Conditions**: Add/edit/remove conditions with labels and expressions
- **Multiple Outputs**: Each condition gets its own output handle
- **Color Coding**: Conditions are automatically color-coded
- **Dynamic Connections**: Connect each condition to different nodes

### StartNode

A specialized node for flow entry points:

- **Output Only**: Has only output handles (right and bottom)
- **No Input**: Cannot be connected to from other nodes
- **Entry Point**: Marks the beginning of a flow or process
- **Green Handles**: Uses green color to indicate start/source

### EndNode

A specialized node for flow termination:

- **Input Only**: Has only input handles (left and top)
- **No Output**: Cannot connect to other nodes
- **Termination**: Marks the end of a flow or process
- **Red Handles**: Uses red color to indicate end/termination

### BooleanNode

A specialized node for boolean logic and branching:

- **Input**: Single input handle on the left
- **Two Outputs**: Separate handles for true (green) and false (red) paths
- **Visual Indicators**: Clear true/false labels with color-coded sections
- **Customizable Labels**: Optional custom labels for true/false outputs

## Using Conditional Nodes

1. **Add a Conditional Node**: Select "conditional" from the node toolbar
2. **Add Conditions**: Click "Add Condition" to create new conditions
3. **Edit Conditions**:
   - **Label**: Human-readable name (e.g., "Adult User")
   - **Expression**: Logic expression (e.g., "user.age >= 18")
4. **Connect Conditions**: Each condition has its own output handle on the right side
5. **Manage Conditions**: Hover over conditions to edit or delete them

## Features

- **Adaptive Layout**: Handles automatically adjust spacing based on number of conditions
- **Real-time Updates**: Changes are saved automatically to the database
- **Visual Feedback**: Color-coded handles match condition badges
- **Inline Editing**: Edit conditions directly in the node
- **Validation**: Prevents empty conditions

## Data Structure

### Standard Node Data

```typescript
{
  type: string;
  label: string;
  description?: string;
  priority: "low" | "medium" | "high";
  hasSubFlow?: boolean;
}
```

### Conditional Node Data

```typescript
{
  type: "conditional";
  label: string;
  description?: string;
  priority: "low" | "medium" | "high";
  conditions: Array<{
    id: string;
    label: string;
    expression: string;
    color: string;
  }>;
}
```

### Start Node Data

```typescript
{
  type: "start";
  label: string;
  description?: string;
  priority: "low" | "medium" | "high";
  hasSubFlow?: boolean;
}
```

### End Node Data

```typescript
{
  type: "end";
  label: string;
  description?: string;
  priority: "low" | "medium" | "high";
  hasSubFlow?: boolean;
}
```

### Boolean Node Data

```typescript
{
  type: "boolean";
  label: string;
  description?: string;
  priority: "low" | "medium" | "high";
  hasSubFlow?: boolean;
  trueLabel?: string;  // Custom label for true output (default: "True")
  falseLabel?: string; // Custom label for false output (default: "False")
}
```

## Events

The nodes communicate with the flow editor through custom events:

- `updateNodeData`: Updates node data (used by conditional nodes)
- `navigateToSubFlow`: Navigates to a sub-flow

## Extending

To add new node types:

1. Create a new component extending `BaseFlowNode`
2. Add it to the `nodeTypeComponents` map in `index.ts`
3. Update the Convex schema if needed
4. Add the type to the flow editor's `addNode` function
