"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileSignatureIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import type { DocSection } from "@/lib/documents/definitions";
import { enumLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AutosaveIndicator, useAutosave } from "@/components/autosave";
import { AiToolbar } from "@/components/documents/ai-toolbar";

export function DocumentEditor({
  documentId,
  docType,
  status,
  sections,
  initialTitle,
  initialContent,
  initialSessionDate,
  patientContext,
}: {
  documentId: string;
  docType: string;
  status: "DRAFT" | "COMPLETED" | "SIGNED" | "AMENDED";
  sections: DocSection[];
  initialTitle: string;
  initialContent: Record<string, string>;
  initialSessionDate: string; // yyyy-MM-dd
  patientContext: string; // non-identifying context for AI ("age 5y, focus: fine motor")
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initialTitle);
  const [sessionDate, setSessionDate] = React.useState(initialSessionDate);
  const [content, setContent] = React.useState<Record<string, string>>(initialContent);
  const signed = status === "SIGNED";

  const saveState = useAutosave({ title, content, sessionDate }, async (data) => {
    if (signed) return;
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("save failed");
  });

  async function doAction(action: "complete" | "sign" | "reopen") {
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        action === "reopen" ? { action } : { title, content, sessionDate, action },
      ),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return void toast.error(data.error ?? "Action failed");
    }
    toast.success(
      action === "sign"
        ? "Document signed"
        : action === "complete"
          ? "Marked as completed"
          : "Reopened for amendment",
    );
    router.refresh();
  }

  async function remove() {
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    if (!res.ok) return void toast.error("Could not delete document");
    toast.success("Document deleted");
    router.push("/documents");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b px-4 py-2 md:mx-0 md:rounded-lg md:border">
        <Badge
          variant={
            status === "SIGNED" ? "success" : status === "DRAFT" ? "warning" : "secondary"
          }
        >
          {enumLabel(status)}
        </Badge>
        <AutosaveIndicator state={saveState} />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/documents/${documentId}/pdf`} target="_blank">
              <DownloadIcon /> PDF
            </a>
          </Button>
          {signed ? (
            <Button variant="outline" size="sm" onClick={() => doAction("reopen")}>
              <RotateCcwIcon /> Amend
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => doAction("complete")}>
                <CheckCircle2Icon /> Complete
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <FileSignatureIcon /> Sign
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign this document?</DialogTitle>
                    <DialogDescription>
                      Signing locks the document with your name and a timestamp.
                      Further changes require an amendment, which is recorded in
                      the audit log.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={() => doAction("sign")}>
                      <FileSignatureIcon /> Sign document
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-destructive">
                <Trash2Icon />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this document?</DialogTitle>
                <DialogDescription>This cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={remove}>
                  Delete permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-64 flex-1">
          <Label className="mb-1.5">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={signed} />
        </div>
        <div>
          <Label className="mb-1.5">Session date</Label>
          <Input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            disabled={signed}
          />
        </div>
      </div>

      {sections.map((section) => (
        <Card key={section.id} className="gap-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">{section.title}</CardTitle>
            {!signed && (
              <AiToolbar
                getText={() => content[section.id] ?? ""}
                context={`${enumLabel(docType)} — section "${section.title}"${section.aiHint ? ` (${section.aiHint})` : ""}. Patient context: ${patientContext}`}
                onResult={(text) =>
                  setContent((c) => ({ ...c, [section.id]: text }))
                }
              />
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              className="min-h-24"
              placeholder={section.placeholder}
              value={content[section.id] ?? ""}
              onChange={(e) =>
                setContent((c) => ({ ...c, [section.id]: e.target.value }))
              }
              disabled={signed}
            />
          </CardContent>
        </Card>
      ))}
      <p className="text-muted-foreground text-xs">
        {format(new Date(), "yyyy")} · Everything autosaves as you type. AI
        suggestions never invent patient information and always require your
        review.
      </p>
    </div>
  );
}
