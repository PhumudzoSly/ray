import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import type { OrganizationMember } from './comment-input'

export interface MentionListProps {
  items: OrganizationMember[]
  command: (item: OrganizationMember) => void
}

export interface MentionListRef {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 max-h-60 overflow-y-auto">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 transition-colors',
              index === selectedIndex ? 'bg-gray-100' : ''
            )}
            onClick={() => selectItem(index)}
          >
            <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                getInitials(item.name)
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-gray-900 truncate">{item.name}</span>
              <span className="text-xs text-gray-500 truncate">{item.email}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500">No results</div>
      )}
    </div>
  )
})

MentionList.displayName = 'MentionList'

export default MentionList