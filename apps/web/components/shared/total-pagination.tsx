"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";

interface PaginationComponentProps {
  total: number;
  route: string;
}

export default function TotalPagination({
  total,
  route,
}: PaginationComponentProps) {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const newPage = searchParams.get("page");
    if (newPage) {
      setPage(parseInt(newPage));
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > total) return;

    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/${route}?${params.toString()}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = total > 7 && page > 4;
    const showEllipsisEnd = total > 7 && page < total - 3;

    if (showEllipsisStart) {
      pages.push(1);
      pages.push("ellipsis-start");
      for (let i = page - 1; i <= Math.min(page + 1, total); i++) {
        pages.push(i);
      }
    } else {
      for (let i = 1; i <= Math.min(4, total); i++) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd) {
      if (page + 2 <= total - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(total);
    } else if (!showEllipsisStart) {
      for (let i = 5; i <= total; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <Pagination className="my-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(page - 1)}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {renderPageNumbers().map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === "ellipsis-start" ||
            pageNumber === "ellipsis-end" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === pageNumber}
                onClick={() => handlePageChange(pageNumber as number)}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(page + 1)}
            className={page >= total ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
