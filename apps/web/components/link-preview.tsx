import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface LinkPreviewProps {
  id: string;
  url: string;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  favigo?: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function LinkPreview({
  id,
  url,
  title,
  description,
  image,
  siteName,
  favigo,
  onDelete,
  isDeleting = false,
}: LinkPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const domain = new URL(url).hostname.replace("www.", "");

  return (
    <Card
      className="relative overflow-hidden transition-all py-0 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex">
          {image && (
            <div className="hidden sm:block w-32 shrink-0 relative">
              <img src={image} alt={title} className="object-cover w-32" />
            </div>
          )}
          <CardContent className="p-2 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {favigo && (
                <div className="w-4 h-4 relative">
                  <img src={favigo} alt="" className="rounded-sm h-4 w-4" />
                </div>
              )}
              <span className="text-xs text-muted-foreground line-clamp-1">
                {siteName || domain}
              </span>
            </div>
            <h4 className="font-medium line-clamp-1">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </CardContent>
        </div>
      </Link>

      {onDelete && (
        <CardFooter className="p-0 absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full opacity-0 transition-opacity ${
              isHovered ? "opacity-100" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(id);
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove link</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
