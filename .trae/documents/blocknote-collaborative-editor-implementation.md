# BlockNote Collaborative Editor - Implementation Guide

## 1. Project Structure

```
apps/web/components/blocknote-editor/
├── index.ts                          # Main exports
├── collaborative-editor.tsx          # Main BlockNote editor component
├── hooks/
│   ├── use-collaboration.ts          # Y.js and WebRTC integration
│   ├── use-document.ts               # Document management
│   └── use-presence.ts               # User presence and awareness
├── components/
│   ├── block-toolbar.tsx             # Contextual block toolbar
│   ├── user-presence.tsx             # Live cursors and user indicators
│   ├── sharing-modal.tsx             # Simple document sharing
│   └── connection-status.tsx         # Connection indicator
├── extensions/
│   └── collaboration-extension.ts    # Y.js BlockNote integration
├── providers/
│   ├── collaboration-provider.tsx    # WebRTC and Y.js provider
│   └── document-provider.tsx         # Document context
├── types/
│   ├── editor.types.ts               # Editor-related types
│   └── collaboration.types.ts        # Collaboration types
└── utils/
    ├── yjs-utils.ts                  # Y.js helper functions
    └── blocknote-utils.ts            # BlockNote utilities
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
    "y-prosemirror": "^1.2.0",
    "zustand": "^4.4.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

## 3. Main Components Implementation

### 3.1 Collaborative Editor Component

```typescript
// apps/web/components/blocknote-editor/collaborative-editor.tsx
"use client"

import { useEffect, useState, useMemo } from 'react'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { BlockNoteView, useCreateBlockNote } from '@blocknote/react'
import { useCollaboration } from './hooks/use-collaboration'
import { usePresence } from './hooks/use-presence'
import { UserPresence } from './components/user-presence'
import { ConnectionStatus } from './components/connection-status'
import { SharingModal } from './components/sharing-modal'
import { User } from './types/collaboration.types'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

interface CollaborativeEditorProps {
  documentId: string
  user?: User
  initialContent?: PartialBlock[]
  isReadOnly?: boolean
  onSave?: (content: PartialBlock[]) => void
  className?: string
}

export function CollaborativeEditor({
  documentId,
  user,
  initialContent,
  isReadOnly = false,
  onSave,
  className
}: CollaborativeEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showSharing, setShowSharing] = useState(false)
  
  const { ydoc, provider, isConnected } = useCollaboration({ 
    documentId,
    user 
  })
  
  const { users, currentUser } = usePresence({ 
    provider,
    user 
  })

  // Create BlockNote editor with Y.js collaboration
  const editor = useCreateBlockNote({
    initialContent,
    collaboration: {
      provider,
      fragment: ydoc.getXmlFragment('document-store'),
      user: {
        name: user?.name || 'Anonymous',
        color: user?.color || '#3b82f6'
      }
    },
    editable: !isReadOnly
  })

  // Handle editor changes for auto-save
  useEffect(() => {
    if (!editor || !onSave) return

    const handleChange = () => {
      const content = editor.document
      onSave(content)
    }

    editor.onChange(handleChange)
    return () => editor.off('change', handleChange)
  }, [editor, onSave])

  // Set loading state when editor is ready
  useEffect(() => {
    if (editor && provider) {
      setIsLoading(false)
    }
  }, [editor, provider])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`blocknote-editor ${className || ''}`}>
      {/* Header with connection status and user presence */}
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <ConnectionStatus isConnected={isConnected} />
        <div className="flex items-center gap-2">
          <UserPresence users={users} />
          {!isReadOnly && (
            <button
              onClick={() => setShowSharing(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Share
            </button>
          )}
        </div>
      </div>

      {/* BlockNote Editor */}
      <div className="p-4">
        <BlockNoteView 
          editor={editor}
          theme="light"
        />
      </div>

      {/* Sharing Modal */}
      {showSharing && (
        <SharingModal
          documentId={documentId}
          onClose={() => setShowSharing(false)}
        />
      )}
    </div>
  )
}
```

### 3.2 Collaboration Hook

```typescript
// apps/web/components/blocknote-editor/hooks/use-collaboration.ts
import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { User } from '../types/collaboration.types'

interface UseCollaborationProps {
  documentId: string
  user?: User
  signalingServers?: string[]
}

export function useCollaboration({ 
  documentId, 
  user,
  signalingServers = ['wss://signaling.yjs.dev'] 
}: UseCollaborationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebrtcProvider | null>(null)

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
            color: user?.color || '#3b82f6',
            avatar: user?.avatar || null
          }
        }
      }
    )
    providerRef.current = provider

    // Connection event handlers
    provider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected')
    })

    provider.on('peers', (event: { added: any[], removed: any[] }) => {
      console.log('Peers changed:', event)
    })

    // Cleanup function
    return () => {
      provider.destroy()
      ydoc.destroy()
    }
  }, [documentId, user, signalingServers])

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    isConnected
  }
}
```

### 3.3 User Presence Hook

```typescript
// apps/web/components/blocknote-editor/hooks/use-presence.ts
import { useEffect, useState } from 'react'
import { WebrtcProvider } from 'y-webrtc'
import { User } from '../types/collaboration.types'

interface UsePresenceProps {
  provider: WebrtcProvider | null
  user?: User
}

export function usePresence({ provider, user }: UsePresenceProps) {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    if (!provider) return

    const awareness = provider.awareness

    // Set current user
    if (user) {
      awareness.setLocalStateField('user', {
        name: user.name,
        color: user.color,
        avatar: user.avatar,
        id: user.id
      })
      setCurrentUser(user)
    }

    // Handle awareness changes
    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().entries())
      const activeUsers: User[] = states
        .map(([clientId, state]) => ({
          id: state.user?.id || clientId.toString(),
          name: state.user?.name || 'Anonymous',
          color: state.user?.color || '#3b82f6',
          avatar: state.user?.avatar || null,
          isOnline: true
        }))
        .filter(u => u.id !== user?.id) // Exclude current user

      setUsers(activeUsers)
    }

    awareness.on('change', handleAwarenessChange)
    handleAwarenessChange() // Initial call

    return () => {
      awareness.off('change', handleAwarenessChange)
    }
  }, [provider, user])

  return { users, currentUser }
}
```

### 3.4 User Presence Component

```typescript
// apps/web/components/blocknote-editor/components/user-presence.tsx
'use client'

import React from 'react'
import { User } from '../types/collaboration.types'

interface UserPresenceProps {
  users: User[]
  maxVisible?: number
}

export function UserPresence({ users, maxVisible = 3 }: UserPresenceProps) {
  const visibleUsers = users.slice(0, maxVisible)
  const remainingCount = users.length - maxVisible

  if (users.length === 0) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
        Only you
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1">
      {visibleUsers.map((user) => (
        <UserAvatar key={user.id} user={user} />
      ))}
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          +{remainingCount}
        </div>
      )}
      <span className="text-sm text-gray-600 ml-2">
        {users.length} online
      </span>
    </div>
  )
}

interface UserAvatarProps {
  user: User
}

function UserAvatar({ user }: UserAvatarProps) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </div>
  )
}
```

### 3.5 Connection Status Component

```typescript
// apps/web/components/blocknote-editor/components/connection-status.tsx
'use client'

import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">Disconnected</span>
        </>
      )}
    </div>
  )
}
```

### 3.6 Simple Sharing Modal

```typescript
// apps/web/components/blocknote-editor/components/sharing-modal.tsx
'use client'

import React, { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

interface SharingModalProps {
  documentId: string
  onClose: () => void
}

export function SharingModal({ documentId, onClose }: SharingModalProps) {
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [copied, setCopied] = useState(false)
  
  const shareUrl = `${window.location.origin}/editor/${documentId}?permission=${permission}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share Document</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission Level
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-l bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 flex items-center"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 4. Type Definitions

### 4.1 Collaboration Types

```typescript
// apps/web/components/blocknote-editor/types/collaboration.types.ts
export interface User {
  id: string
  name: string
  email?: string
  avatar?: string | null
  color?: string
  isOnline?: boolean
}

export interface DocumentMetadata {
  id: string
  title: string
  ownerId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface DocumentShare {
  id: string
  documentId: string
  userId: string
  permission: 'view' | 'edit'
  createdAt: string
}

export interface CollaborationState {
  isConnected: boolean
  users: User[]
  currentUser: User | null
  documentId: string
}
```

### 4.2 Editor Types

```typescript
// apps/web/components/blocknote-editor/types/editor.types.ts
import { PartialBlock } from '@blocknote/core'

export interface EditorProps {
  documentId: string
  initialContent?: PartialBlock[]
  isReadOnly?: boolean
  user?: User
  onSave?: (content: PartialBlock[]) => void
  className?: string
}

export interface EditorState {
  isLoading: boolean
  isConnected: boolean
  hasUnsavedChanges: boolean
  lastSaved?: Date
}
```

## 5. Main Exports

```typescript
// apps/web/components/blocknote-editor/index.ts
// Main collaborative editor component
export { CollaborativeEditor } from './collaborative-editor'

// Components
export { UserPresence } from './components/user-presence'
export { ConnectionStatus } from './components/connection-status'
export { SharingModal } from './components/sharing-modal'

// Hooks
export { useCollaboration } from './hooks/use-collaboration'
export { usePresence } from './hooks/use-presence'
export { useDocument } from './hooks/use-document'

// Types
export type {
  User,
  DocumentMetadata,
  DocumentShare,
  CollaborationState
} from './types/collaboration.types'

export type {
  EditorProps,
  EditorState
} from './types/editor.types'
```

## 6. Usage Example

```typescript
// apps/web/app/(dashboard)/project/[id]/doc/page.tsx
import { CollaborativeEditor } from '@/components/blocknote-editor'
import { getSession } from '@/actions/account/user'
import { DocumentService } from '@workspace/backend'

interface DocPageProps {
  params: Promise<{ id: string }>
}

export default async function DocPage({ params }: DocPageProps) {
  const { id } = await params
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const document = await DocumentService.getById(id)
  
  const user = {
    id: session.user.id,
    name: session.user.name || 'Anonymous',
    email: session.user.email,
    avatar: session.user.avatar_url,
    color: '#3b82f6'
  }

  return (
    <div className="h-screen">
      <CollaborativeEditor
        documentId={id}
        user={user}
        initialContent={document.content}
        onSave={(content) => {
          // Auto-save functionality
          DocumentService.update(id, { content })
        }}
      />
    </div>
  )
}
```

This implementation provides a streamlined, BlockNote-based collaborative editor that focuses on core editing functionality and real-time collaboration while removing unnecessary complexity from the previous Tiptap implementation.