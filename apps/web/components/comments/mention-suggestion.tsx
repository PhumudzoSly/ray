import { ReactRenderer } from "@tiptap/react"
import tippy from "tippy.js"
import { SuggestionOptions } from "@tiptap/suggestion"
import MentionList, { MentionListRef } from "./mention-list"
import type { OrganizationMember } from "./comment-input"

export const suggestion = (
  getMembers: () => OrganizationMember[]
): Omit<SuggestionOptions, "editor"> => ({
  items: ({ query }) => {
    const members = getMembers()
    return members
      .filter(
        (member) =>
          member.name.toLowerCase().startsWith(query.toLowerCase()) ||
          member.email.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, 5)
  },

  command: ({ editor, range, props }) => {
    // Insert mention with user's name as label
    editor
      .chain()
      .focus()
      .insertContentAt(range, [
        {
          type: "mention",
          attrs: {
            id: props.id,
            label: props.name,
          },
        },
        {
          type: "text",
          text: " ",
        },
      ])
      .run()
  },

  render: () => {
    let component: ReactRenderer
    let popup: any

    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy("body", {
          getReferenceClientRect: () => props?.clientRect?.() || new DOMRect(),
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: () => props.clientRect?.() || new DOMRect(),
        })
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0].hide()
          return true
        }

        return (component.ref as MentionListRef)?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
})
