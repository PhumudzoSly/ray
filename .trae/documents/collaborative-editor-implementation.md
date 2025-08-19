# BlockNote Collaborative Editor - Implementation Guide

## 1. Project Structure

```
apps/web/components/editor/
├── index.ts                          # Main exports
├── collaborative-editor.tsx          # Main BlockNote editor component
├── hooks/
│   ├── use-collaboration.ts          # Y-js and WebRTC integration
│   ├── use-document.ts               # Document management with Prisma
│   ├── use-presence.ts               # User presence and awareness
│   └── use-auto-save.ts              # Auto-save functionality
├── components/
│   ├── block-controls.tsx            # BlockNote block controls
│   ├── user-presence.tsx             # Live cursors and user list
│   ├── organization-context.tsx      # Organization and project context
│   └── connection-status.tsx         # WebRTC connection indicator
├── extensions/
│   ├── collaboration-extension.ts    # Y-js BlockNote extension
│   └── mention-extension.ts          # User mentions
├── providers/
│   ├── collaboration-provider.tsx    # WebRTC and Y-js provider
│   └── document-provider.tsx         # Document context with Prisma
├── types/
│   ├── editor.types.ts               # Editor-related types
│   ├── collaboration.types.ts        # Collaboration types
│   └── document.types.ts             # Document types
└── utils/
    ├── yjs-utils.ts                  # Y-js helper functions
    ├── webrtc-utils.ts               # WebRTC utilities
    └── blocknote-utils.ts            # BlockNote helper functions
```

## 2. Core Dependencies

```json
{
  "dependencies": {
    "@blocknote/core": "^0.15.0",
    "@blocknote/react": "^0.15.0",
    "@blocknote/mantine": "^0.15.0",
    "yjs": "^13.6.0",
    "y-webrtc": "^10.2.0",
    "y-blocknote": "^0.1.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0"
  }
}
```

## 3. Main Components Implementation

### 3.1 Collaborative Editor Component

```typescript
// apps/web/components/editor/collaborative-editor.tsx
"use client"

import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { BlockNoteView, useCreateBlockNote } from '@blocknote/react'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { useCollaboration } from './hooks/use-collaboration'
import { usePresence } from './hooks/use-presence'
import { useDocument } from './hooks/use-document'
import { useAutoSave } from './hooks/use-auto-save'
import { UserPresence } from './components/user-presence'
import { ConnectionStatus } from './components/connection-status'
import { OrganizationContext } from './components/organization-context'
import { useTheme } from 'next-themes'

interface CollaborativeEditorProps {
  documentId: string
  organizationId: string
  projectId?: string
  initialContent?: PartialBlock[]
  isReadOnly?: boolean
}

export function CollaborativeEditor({
  documentId,
  organizationId,
  projectId,
  initialContent,
  isReadOnly = false
}: CollaborativeEditorProps) {
  const { theme } = useTheme()
  const { ydoc, provider, isConnected } = useCollaboration({ documentId })
  const { users, currentUser } = usePresence({ provider })
  const { document, updateDocument } = useDocument({ documentId })
  
  // Create BlockNote editor with Y.js collaboration
  const editor = useCreateBlockNote({
    initialContent: initialContent || document?.content as PartialBlock[],
    collaboration: {
      provider,
      fragment: ydoc?.getXmlFragment('document-store'),
      user: {
        name: currentUser.name,
        color: currentUser.color,
      },
    },
    editable: !isReadOnly,
  })

  // Auto-save functionality
  useAutoSave({
    editor,
    documentId,
    onSave: (content) => updateDocument({ content }),
    debounceMs: 2000,
  })

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header with connection status and context */}
        <div className="border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ConnectionStatus isConnected={isConnected} />
            <OrganizationContext 
              organizationId={organizationId}
              projectId={projectId}
              documentTitle={document?.title}
            />
          </div>
          <UserPresence users={users} currentUser={currentUser} />
        </div>

        {/* BlockNote Editor */}
        <div className="flex-1 overflow-auto">
          <BlockNoteView 
            editor={editor}
            theme={theme === 'dark' ? 'dark' : 'light'}
            className="min-h-full p-4"
          />
        </div>
      </div>
    </div>
  )
}
```

### 3.2 Collaboration Hook

```typescript
// apps/web/components/editor/hooks/use-collaboration.ts
import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { useUser } from '@/hooks/use-user'

interface UseCollaborationProps {
  documentId: string
  signalingServers?: string[]
}

export function useCollaboration({ 
  documentId, 
  signalingServers = ['wss://signaling.yjs.dev'] 
}: UseCollaborationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebrtcProvider | null>(null)
  const { user } = useUser()

  useEffect(() => {
    // Initialize Y.js document
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    // Initialize WebRTC provider
    const provider = new WebrtcProvider(
      `blocknote-${documentId}`,
      ydoc,
      {
        signaling: signalingServers,
        password: null,
        awareness: {
          meta: {
            name: user?.name || 'Anonymous User',
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            userId: user?.id || 'anonymous',
          }
        }
      }
    )
    providerRef.current = provider

    // Connection event handlers
    provider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected')
    })

    provider.on('peers', (event: { added: string[], removed: string[] }) => {
      console.log('Peers changed:', event)
    })

    // Cleanup on unmount
    return () => {
      provider.destroy()
      ydoc.destroy()
    }
  }, [documentId, user])

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    isConnected
  }
}
```

### 3.3 Document Management Hook

```typescript
// apps/web/components/editor/hooks/use-document.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PartialBlock } from '@blocknote/core'

interface Document {
  id: string
  title: string
  content: PartialBlock[]
  version: number
  organizationId: string
  projectId?: string
  createdById: string
  lastEditedById?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

interface UseDocumentProps {
  documentId: string
}

export function useDocument({ documentId }: UseDocumentProps) {
  const queryClient = useQueryClient()

  // Fetch document
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }
      return response.json() as Document
    },
  })

  // Update document content
  const updateMutation = useMutation({
    mutationFn: async ({ content, title }: { content?: PartialBlock[], title?: string }) => {
      const response = await fetch(`/api/documents/${documentId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, title }),
      })
      if (!response.ok) {
        throw new Error('Failed to update document')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] })
    },
  })

  return {
    document,
    isLoading,
    error,
    updateDocument: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}
```

### 3.4 Auto-save Hook

```typescript
// apps/web/components/editor/hooks/use-auto-save.ts
import { useEffect, useRef } from 'react'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { debounce } from 'lodash'

interface UseAutoSaveProps {
  editor: BlockNoteEditor
  documentId: string
  onSave: (content: PartialBlock[]) => void
  debounceMs?: number
}

export function useAutoSave({
  editor,
  documentId,
  onSave,
  debounceMs = 2000,
}: UseAutoSaveProps) {
  const debouncedSave = useRef(
    debounce((content: PartialBlock[]) => {
      onSave(content)
    }, debounceMs)
  ).current

  useEffect(() => {
    const handleChange = () => {
      const content = editor.document
      debouncedSave(content)
    }

    editor.onChange(handleChange)

    return () => {
      debouncedSave.cancel()
    }
  }, [editor, debouncedSave])

  useEffect(() => {
    return () => {
      debouncedSave.flush() // Save any pending changes on unmount
    }
  }, [debouncedSave])
}
```

### 3.5 User Presence Hook

```typescript
// apps/web/components/editor/hooks/use-presence.ts
import { useEffect, useState } from 'react'
import { WebrtcProvider } from 'y-webrtc'
import { useUser } from '@/hooks/use-user'

interface CollaborativeUser {
  id: string
  name: string
  email: string
  color: string
  cursor?: { x: number, y: number }
}

interface UsePresenceProps {
  provider: WebrtcProvider | null
}

export function usePresence({ provider }: UsePresenceProps) {
  const [users, setUsers] = useState<CollaborativeUser[]>([])
  const { user: currentUser } = useUser()
  
  const currentUserData = {
    id: currentUser?.id || 'anonymous',
    name: currentUser?.name || 'Anonymous User',
    email: currentUser?.email || '',
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
  }

  useEffect(() => {
    if (!provider) return

    const awareness = provider.awareness

    // Set current user awareness
    awareness.setLocalStateField('user', currentUserData)

    // Listen for awareness changes
    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries())
      const activeUsers = states
        .filter(([clientId]) => clientId !== awareness.clientID)
        .map(([clientId, state]) => ({
          id: clientId.toString(),
          ...state.user,
          cursor: state.cursor
        }))
      
      setUsers(activeUsers)
    }

    awareness.on('change', updateUsers)
    updateUsers() // Initial load

    return () => {
      awareness.off('change', updateUsers)
    }
  }, [provider, currentUser])

  return {
    users,
    currentUser: currentUserData
  }
}
```

### 3.6 Component Implementations

#### Connection Status Component

```typescript
// apps/web/components/editor/components/connection-status.tsx
import { Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <Badge 
      variant={isConnected ? 'default' : 'destructive'}
      className="flex items-center gap-1"
    >
      {isConnected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {isConnected ? 'Connected' : 'Disconnected'}
    </Badge>
  )
}
```

#### Organization Context Component

```typescript
// apps/web/components/editor/components/organization-context.tsx
import { Building, Folder, FileText } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Separator } from '@workspace/ui/components/separator'

interface OrganizationContextProps {
  organizationId: string
  projectId?: string
  documentTitle?: string
}

export function OrganizationContext({
  organizationId,
  projectId,
  documentTitle
}: OrganizationContextProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Building className="h-3 w-3" />
        <span>Organization</span>
      </div>
      
      {projectId && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            <span>Project</span>
          </div>
        </>
      )}
      
      {documentTitle && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span className="font-medium text-foreground">{documentTitle}</span>
          </div>
        </>
      )}
    </div>
  )
}
```

#### User Presence Component

```typescript
// apps/web/components/editor/components/user-presence.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip'
import { CollaborativeUser } from '../hooks/use-presence'

interface UserPresenceProps {
  users: CollaborativeUser[]
  currentUser: CollaborativeUser
}

export function UserPresence({ users, currentUser }: UserPresenceProps) {
  const allUsers = [currentUser, ...users]
  const maxVisible = 5
  const visibleUsers = allUsers.slice(0, maxVisible)
  const remainingCount = Math.max(0, allUsers.length - maxVisible)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {allUsers.length} {allUsers.length === 1 ? 'user' : 'users'} online
      </span>
      
      <div className="flex items-center -space-x-2">
        <TooltipProvider>
          {visibleUsers.map((user, index) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <Avatar 
                  className="h-8 w-8 border-2 border-background"
                  style={{ borderColor: user.color }}
                >
                  <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                  <AvatarFallback 
                    className="text-xs"
                    style={{ backgroundColor: user.color + '20', color: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name} {user.id === currentUser.id ? '(You)' : ''}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {remainingCount > 0 && (
            <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 text-xs">
              +{remainingCount}
            </Badge>
          )}
        </TooltipProvider>
      </div>
    </div>
  )
}
```

## 4. Integration Steps

### 4.1 Package Installation

```bash
# Navigate to the web app directory
cd apps/web

# Install BlockNote and collaboration dependencies
pnpm add @blocknote/core @blocknote/react @blocknote/mantine

# Install Y-js and WebRTC for real-time collaboration
pnpm add yjs y-webrtc y-blocknote

# Install TanStack Query for server state management
pnpm add @tanstack/react-query

# Install utility libraries
pnpm add lodash
pnpm add -D @types/lodash
```

### 4.2 Environment Configuration

```env
# .env.local
# WebRTC signaling servers for real-time collaboration
NEXT_PUBLIC_WEBRTC_SIGNALING_SERVERS=wss://signaling.yjs.dev,wss://y-webrtc-signaling-eu.herokuapp.com

# Database connection (handled by backend)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### 4.3 Backend API Routes

Create the following API routes to integrate with the Prisma backend:

```typescript
// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@workspace/backend/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
        project: true,
        createdBy: true,
        lastEditedBy: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

```typescript
// app/api/documents/[id]/content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@workspace/backend/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, title } = await request.json()

    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        ...(content && { content }),
        ...(title && { title }),
        lastEditedById: session.user.id,
        version: { increment: 1 },
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 4.3 Usage Example

```tsx
// app/editor/[documentId]/page.tsx
import { CollaborativeEditor } from '@/components/editor/collaborative-editor'
import { auth } from '@/lib/auth'
import { prisma } from '@workspace/backend/lib/prisma'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

interface EditorPageProps {
  params: {
    documentId: string
  }
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Fetch document data with organization context
  const document = await prisma.document.findUnique({
    where: { id: params.documentId },
    include: {
      organization: true,
      project: true,
      createdBy: true,
      lastEditedBy: true,
    },
  })

  if (!document) {
    redirect('/dashboard')
  }

  // Check if user has access to this document's organization
  const userOrganization = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organizationId: document.organizationId,
    },
  })

  if (!userOrganization) {
    redirect('/dashboard')
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{document.title}</h1>
            <p className="text-sm text-muted-foreground">
              {document.organization.name} • {document.project?.name || 'No Project'}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Version {document.version}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Suspense fallback={<div className="p-4">Loading editor...</div>}>
          <CollaborativeEditor
            documentId={params.documentId}
            organizationId={document.organizationId}
            projectId={document.projectId}
            initialContent={document.content}
          />
        </Suspense>
      </main>
    </div>
  )
}
```

### 4.4 Query Client Setup

```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## 5. Performance Considerations

### 5.1 Lazy Loading
- Load BlockNote editor components only when needed
- Use dynamic imports for heavy dependencies
- Implement code splitting for better initial load times
- Lazy load block extensions and plugins

### 5.2 Debounced Updates
- Implement debounced auto-save to reduce API calls to Prisma backend
- Use throttling for real-time collaboration updates
- Batch multiple changes before syncing to database
- Optimize Y.js document synchronization intervals

### 5.3 Connection Management
- Implement reconnection logic for WebRTC
- Handle network interruptions gracefully
- Provide visual feedback for connection status
- Manage Y.js provider lifecycle efficiently

### 5.4 Memory Management
- Clean up Y.js documents when components unmount
- Dispose of WebRTC connections properly
- Monitor memory usage in long editing sessions
- Implement proper cleanup for BlockNote editor instances

### 5.5 Database Optimization
- Use TanStack Query for efficient caching and background updates
- Implement optimistic updates for better user experience
- Use Prisma query optimization techniques
- Index frequently queried document fields

### 5.6 Offline Support
- Cache document content using TanStack Query
- Queue changes when offline using Y.js persistence
- Sync changes when connection is restored
- Provide offline indicators and conflict resolution

## 6. Security Considerations

### 6.1 Authentication & Authorization
- Verify user authentication before allowing editor access
- Implement session management and token refresh
- Use secure authentication flows with Next.js middleware
- Validate organization membership for document access

### 6.2 Content Sanitization
- Sanitize BlockNote content before saving to database
- Validate document structure and block content
- Prevent XSS attacks through content filtering
- Use Prisma's built-in SQL injection protection

### 6.3 Rate Limiting
- Implement rate limiting for document updates at API level
- Prevent spam and abuse through API throttling
- Monitor and log suspicious activities
- Use Redis or similar for distributed rate limiting

### 6.4 Access Control
- Implement organization-based access control
- Verify user permissions for document access through Prisma queries
- Audit document access and modifications
- Use database-level constraints for data integrity

### 6.5 WebRTC Security
- Use secure signaling servers for Y.js WebRTC provider
- Implement proper peer authentication
- Monitor and limit connection attempts
- Use encrypted communication channels

### 6.6 API Security
- Validate all API inputs using Zod schemas
- Implement CSRF protection
- Use secure HTTP headers
- Log and monitor API usage patterns

