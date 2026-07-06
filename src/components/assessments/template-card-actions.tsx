"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopyIcon, MoreHorizontalIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TemplateCardActions({ templateId }: { templateId: string }) {
  const router = useRouter();

  async function duplicate() {
    const res = await fetch(`/api/templates/${templateId}`, { method: "POST" });
    if (!res.ok) return void toast.error("Could not duplicate template");
    toast.success("Template duplicated");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="ml-auto">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/assessments/templates/${templateId}`)}
        >
          <PencilIcon /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={duplicate}>
          <CopyIcon /> Duplicate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
