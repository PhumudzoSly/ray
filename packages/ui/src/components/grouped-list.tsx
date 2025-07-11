"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

export interface GroupedListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: React.ReactNode;
  avatar?: React.ReactNode;
  status?: string;
  progress?: number;
  onClick?: () => void;
  className?: string;
}

export interface GroupedListGroup {
  id: string;
  title: string;
  color: string;
  items: GroupedListItem[];
  count?: number;
  icon?: React.ReactNode;
}

interface GroupedListProps {
  groups: GroupedListGroup[];
  onItemMove?: (
    itemId: string,
    fromGroupId: string,
    toGroupId: string,
    newIndex: number
  ) => void;
  onItemClick?: (item: GroupedListItem) => void;
  enableDragAndDrop?: boolean;
  className?: string;
  itemClassName?: string;
  groupClassName?: string;
}

interface GroupedListItemProps {
  item: GroupedListItem;
  index: number;
  onItemClick?: (item: GroupedListItem) => void;
  className?: string;
  isDragging?: boolean;
  enableDragAndDrop?: boolean;
}

function GroupedListItemComponent({
  item,
  index,
  onItemClick,
  className,
  isDragging,
  enableDragAndDrop = true,
}: GroupedListItemProps) {
  const itemContent = (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        "bg-card border border-border hover:border-border/80",
        "hover:shadow-sm hover:bg-accent/50",
        "cursor-pointer select-none",
        isDragging && "opacity-50 shadow-lg scale-[1.02] z-50",
        className,
        item.className
      )}
      onClick={() => onItemClick?.(item)}
    >
      {/* Avatar/Icon */}
      {item.avatar && <div className="flex-shrink-0">{item.avatar}</div>}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-foreground truncate text-sm">
            {item.title}
          </h3>
          {item.status && (
            <Badge variant="outline" className="text-xs font-medium">
              {item.status}
            </Badge>
          )}
        </div>

        {item.subtitle && (
          <p className="text-xs text-muted-foreground mb-1">{item.subtitle}</p>
        )}

        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Progress bar */}
        {item.progress !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round(item.progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      {item.metadata && (
        <div className="flex-shrink-0 text-xs text-muted-foreground">
          {item.metadata}
        </div>
      )}

      {/* Drag indicator - only show when drag and drop is enabled */}
      {enableDragAndDrop && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
        </div>
      )}
    </div>
  );

  if (!enableDragAndDrop) {
    return itemContent;
  }

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {React.cloneElement(itemContent as React.ReactElement, {
            className: cn(
              itemContent.props.className,
              snapshot.isDragging && "opacity-50 shadow-lg scale-[1.02] z-50"
            ),
          })}
        </div>
      )}
    </Draggable>
  );
}

interface GroupedListGroupProps {
  group: GroupedListGroup;
  onItemClick?: (item: GroupedListItem) => void;
  itemClassName?: string;
  className?: string;
  enableDragAndDrop?: boolean;
}

function GroupedListGroupComponent({
  group,
  onItemClick,
  itemClassName,
  className,
  enableDragAndDrop = true,
}: GroupedListGroupProps) {
  const itemsContent = (
    <div className={cn("space-y-2 min-h-[2px] pt-2")}>
      {group.items.map((item, index) => (
        <GroupedListItemComponent
          key={item.id}
          item={item}
          index={index}
          onItemClick={onItemClick}
          className={itemClassName}
          enableDragAndDrop={enableDragAndDrop}
        />
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Group Header - Sticky like Linear */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 py-2 -mx-1 px-1">
        <div className="flex items-center gap-2">
          {group.icon && <div className="flex-shrink-0">{group.icon}</div>}
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: group.color }}
          />
          <h2 className="font-medium text-foreground text-sm">{group.title}</h2>
          <Badge variant="secondary" className="text-xs font-medium">
            {group.count ?? group.items.length}
          </Badge>
        </div>
      </div>

      {/* Items */}
      {enableDragAndDrop ? (
        <Droppable droppableId={group.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "space-y-2 min-h-[2px] pt-2",
                snapshot.isDraggingOver && "bg-accent/20 rounded-lg p-2 -m-2"
              )}
            >
              {group.items.map((item, index) => (
                <GroupedListItemComponent
                  key={item.id}
                  item={item}
                  index={index}
                  onItemClick={onItemClick}
                  className={itemClassName}
                  enableDragAndDrop={enableDragAndDrop}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        itemsContent
      )}
    </div>
  );
}

export function GroupedList({
  groups,
  onItemMove,
  onItemClick,
  enableDragAndDrop = true,
  className,
  itemClassName,
  groupClassName,
}: GroupedListProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onItemMove?.(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  const content = (
    <div className={cn("space-y-4", className)}>
      {groups.map((group) => (
        <GroupedListGroupComponent
          key={group.id}
          group={group}
          onItemClick={onItemClick}
          itemClassName={itemClassName}
          className={groupClassName}
          enableDragAndDrop={enableDragAndDrop}
        />
      ))}
    </div>
  );

  if (!enableDragAndDrop) {
    return content;
  }

  return <DragDropContext onDragEnd={handleDragEnd}>{content}</DragDropContext>;
}
