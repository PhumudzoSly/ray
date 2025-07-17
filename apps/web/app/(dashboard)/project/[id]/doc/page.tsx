'use client'
import { Comments } from "@/components/liveblocks/comments"
import { Room } from "@/components/liveblocks/room"
import Editor from "@/components/shared/editor"
import { Inbox } from "lucide-react"
import { useParams } from "next/navigation"

export default function DocPage() {
    const params = useParams()
    const id = params.id as string

    return <div>
        <Room id={id}>
            <div>
                <Editor />
                <div className="flex items-center gap-2 mt-10 mb-4">
                    <Inbox size={18} />
                    <h6>Comments</h6>
                </div>
                <Comments id={id} />
            </div>
        </Room>
    </div>
}