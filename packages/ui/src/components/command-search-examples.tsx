"use client";

import React from "react";
import {
  CommandSearch,
  useSearchConfig,
  SearchItem,
} from "@workspace/ui/components/command-search";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import {
  User,
  FileText,
  Settings,
  Search,
  Calendar,
  Mail,
  Phone,
  Building,
  FolderOpen,
  Star,
  Clock,
  Hash,
} from "lucide-react";

// Example 1: User Search
interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  status: "online" | "offline" | "away";
}

const mockUsers: UserData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Developer",
    department: "Engineering",
    status: "online",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Designer",
    department: "Design",
    status: "away",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Manager",
    department: "Product",
    status: "offline",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "QA Engineer",
    department: "Engineering",
    status: "online",
  },
];

export function UserSearchExample() {
  const config = useSearchConfig({
    placeholder: "Search users...",
    emptyMessage: "No users found",
    showRecentSearches: true,
    recentSearchesKey: "users",
    searchKeys: ["name", "email", "role", "department"],
    items: mockUsers.map((user) => ({
      id: user.id,
      value: user.name,
      keywords: [user.email, user.role, user.department],
      data: user,
    })),
    renderItem: (item: SearchItem) => {
      const user = item.data as UserData;
      return (
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{user.name}</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  user.status === "online"
                    ? "bg-green-500"
                    : user.status === "away"
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                }`}
              />
            </div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs">
              {user.role}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {user.department}
            </span>
          </div>
        </div>
      );
    },
    onSelect: (item) => {
      console.log("Selected user:", item.data);
      // Navigate to user profile or perform action
    },
  });

  return <CommandSearch config={config} />;
}

// Example 2: Project/File Search
interface ProjectData {
  id: string;
  name: string;
  type: "project" | "file" | "folder";
  path: string;
  lastModified: Date;
  size?: string;
  starred?: boolean;
}

const mockProjects: ProjectData[] = [
  {
    id: "1",
    name: "RayAI Dashboard",
    type: "project",
    path: "/projects/rayai",
    lastModified: new Date(),
    starred: true,
  },
  {
    id: "2",
    name: "components.tsx",
    type: "file",
    path: "/src/components.tsx",
    lastModified: new Date(),
    size: "45KB",
  },
  {
    id: "3",
    name: "utils",
    type: "folder",
    path: "/src/utils",
    lastModified: new Date(),
  },
  {
    id: "4",
    name: "package.json",
    type: "file",
    path: "/package.json",
    lastModified: new Date(),
    size: "2KB",
  },
];

export function ProjectSearchExample() {
  const config = useSearchConfig({
    placeholder: "Search projects, files, and folders...",
    emptyMessage: "No items found",
    groups: [
      {
        id: "starred",
        heading: "Starred",
        items: mockProjects
          .filter((p) => p.starred)
          .map((project) => ({
            id: project.id,
            value: project.name,
            keywords: [project.path, project.type],
            data: project,
          })),
      },
      {
        id: "recent",
        heading: "Recent",
        items: mockProjects
          .filter((p) => !p.starred)
          .map((project) => ({
            id: project.id,
            value: project.name,
            keywords: [project.path, project.type],
            data: project,
          })),
      },
    ],
    renderItem: (item: SearchItem) => {
      const project = item.data as ProjectData;
      const Icon =
        project.type === "project"
          ? Building
          : project.type === "file"
            ? FileText
            : FolderOpen;

      return (
        <div className="flex items-center gap-3 p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{project.name}</span>
              {project.starred && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="text-sm text-muted-foreground">{project.path}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs">
              {project.type}
            </Badge>
            {project.size && (
              <span className="text-xs text-muted-foreground">
                {project.size}
              </span>
            )}
          </div>
        </div>
      );
    },
    onSelect: (item) => {
      console.log("Selected project:", item.data);
      // Navigate to project or open file
    },
  });

  return <CommandSearch config={config} />;
}

// Example 3: Command Palette
interface CommandData {
  id: string;
  name: string;
  description: string;
  category: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mockCommands: CommandData[] = [
  {
    id: "1",
    name: "Create New Project",
    description: "Start a new project",
    category: "Actions",
    shortcut: "⌘N",
    icon: Building,
  },
  {
    id: "2",
    name: "Open Settings",
    description: "Configure your preferences",
    category: "Navigation",
    shortcut: "⌘,",
    icon: Settings,
  },
  {
    id: "3",
    name: "Search Files",
    description: "Find files in your workspace",
    category: "Actions",
    shortcut: "⌘P",
    icon: Search,
  },
  {
    id: "4",
    name: "View Calendar",
    description: "Check your schedule",
    category: "Navigation",
    icon: Calendar,
  },
  {
    id: "5",
    name: "Send Email",
    description: "Compose a new email",
    category: "Actions",
    icon: Mail,
  },
];

export function CommandPaletteExample() {
  const config = useSearchConfig({
    placeholder: "Type a command or search...",
    emptyMessage: "No commands found",
    groups: [
      {
        id: "actions",
        heading: "Actions",
        items: mockCommands
          .filter((cmd) => cmd.category === "Actions")
          .map((command) => ({
            id: command.id,
            value: command.name,
            keywords: [command.description, command.category],
            data: command,
          })),
      },
      {
        id: "navigation",
        heading: "Navigation",
        items: mockCommands
          .filter((cmd) => cmd.category === "Navigation")
          .map((command) => ({
            id: command.id,
            value: command.name,
            keywords: [command.description, command.category],
            data: command,
          })),
      },
    ],
    renderItem: (item: SearchItem) => {
      const command = item.data as CommandData;
      const Icon = command.icon;

      return (
        <div className="flex items-center gap-3 p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="font-medium">{command.name}</div>
            <div className="text-sm text-muted-foreground">
              {command.description}
            </div>
          </div>
          {command.shortcut && (
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 flex">
              {command.shortcut}
            </kbd>
          )}
        </div>
      );
    },
    onSelect: (item) => {
      console.log("Execute command:", item.data);
      // Execute the command
    },
  });

  return <CommandSearch config={config} shortcut={["cmd", "shift", "p"]} />;
}

// Example 4: Async Search with API
interface SearchResultData {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  score?: number;
}

export function AsyncSearchExample() {
  const config = useSearchConfig({
    placeholder: "Search across all content...",
    emptyMessage: "No results found",
    loadingMessage: "Searching...",
    showRecentSearches: true,
    recentSearchesKey: "global-search",
    onSearch: async (query: string): Promise<SearchItem[]> => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock search results
      const mockResults: SearchResultData[] = [
        {
          id: "1",
          title: `Result for "${query}"`,
          description: "This is a search result",
          type: "Document",
          score: 0.95,
        },
        {
          id: "2",
          title: `Another result for "${query}"`,
          description: "Another search result",
          type: "Article",
          score: 0.87,
        },
        {
          id: "3",
          title: `Third result for "${query}"`,
          description: "Yet another result",
          type: "Video",
          score: 0.76,
        },
      ];

      return mockResults.map((result) => ({
        id: result.id,
        value: result.title,
        keywords: [result.description, result.type],
        data: result,
      }));
    },
    renderItem: (item: SearchItem) => {
      const result = item.data as SearchResultData;

      return (
        <div className="flex items-center gap-3 p-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{result.title}</span>
              {result.score && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(result.score * 100)}%
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {result.description}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {result.type}
          </Badge>
        </div>
      );
    },
    onSelect: (item) => {
      console.log("Selected result:", item.data);
      // Navigate to result or perform action
    },
  });

  return <CommandSearch config={config} />;
}

// Example 5: Custom Trigger
export function CustomTriggerExample() {
  const config = useSearchConfig({
    placeholder: "Search anything...",
    items: mockUsers.map((user) => ({
      id: user.id,
      value: user.name,
      data: user,
    })),
    renderItem: (item: SearchItem) => <div className="p-2">{item.value}</div>,
    onSelect: (item) => console.log("Selected:", item),
  });

  const customTrigger = (
    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
      🔍 Custom Search Button
    </button>
  );

  return <CommandSearch config={config} trigger={customTrigger} />;
}
