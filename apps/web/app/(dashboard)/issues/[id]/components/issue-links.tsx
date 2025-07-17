"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Link as LinkIcon, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@workspace/ui/components/form";
import { LinkPreview } from "@/components/link-preview";
import { useIssueLinks } from "@/hooks/use-issue-links";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { toast } from "sonner";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

interface IssueLinksProps {
  issueId: string;
}

interface IssueLink {
  id: string;
  url: string;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
  };
}

export default function IssueLinks({ issueId }: IssueLinksProps) {
  const confirm = useConfirm();
  const [isAdding, setIsAdding] = useState(false);
  const { links, isLoading, createLink, isCreating, deleteLink, isDeleting } =
    useIssueLinks(issueId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const handleCreateLink = async (values: z.infer<typeof formSchema>) => {
    if (isCreating) return;

    try {
      const result = await createLink({ url: values.url, issueId });

      toast.promise(Promise.resolve(), {
        loading: "Adding link...",
        success: "Link added successfully",
        error: "Failed to add link",
      });

      if (result?.success) {
        form.reset();
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Error creating link:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;

    const result = await confirm({
      title: "Remove link",
      description: "Are you sure you want to remove this link?",
    });

    if (!result) return;

    try {
      const deleteResult = await deleteLink({ id, issueId });

      toast.promise(Promise.resolve(), {
        loading: "Removing link...",
        success: "Link removed successfully",
        error: "Failed to remove link",
      });
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isAdding && links.length === 0 ? (
        <div className="flex items-center gap-2 justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Links</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add link
          </Button>
        </div>
      ) : isAdding ? (
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateLink)}>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Paste a link and press Enter"
                          className="h-8 pr-8 text-sm"
                          disabled={isCreating}
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-8 w-8"
                          onClick={() => {
                            setIsAdding(false);
                            form.reset();
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Links</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add link
            </Button>
          </div>
          <div className="space-y-2">
            {links.map((link: IssueLink) => (
              <LinkPreview
                key={link.id}
                id={link.id}
                url={link.url}
                title={link.metadata?.title || new URL(link.url).hostname}
                description={link.metadata?.description}
                image={link.metadata?.image}
                siteName={link.metadata?.siteName}
                favigo={
                  link.metadata?.favicon ||
                  `https://www.google.com/s2/favicons?domain=${link.url}&sz=64`
                }
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
