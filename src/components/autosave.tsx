"use client";

import * as React from "react";
import { CheckIcon, CloudUploadIcon, Loader2Icon } from "lucide-react";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * Debounced autosave hook used across all editors: watches `data`, waits
 * 1.2s after the last change, then calls `save`. Re-runs if more changes
 * arrived while a save was in flight.
 */
export function useAutosave<T>(
  data: T,
  save: (data: T) => Promise<void>,
  delayMs = 1200,
): SaveState {
  const [state, setState] = React.useState<SaveState>("idle");
  const first = React.useRef(true);
  const saveRef = React.useRef(save);
  React.useEffect(() => {
    saveRef.current = save;
  });

  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setState("dirty");
    const t = setTimeout(async () => {
      setState("saving");
      try {
        await saveRef.current(data);
        setState("saved");
      } catch {
        setState("error");
      }
    }, delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return state;
}

export function AutosaveIndicator({ state }: { state: SaveState }) {
  return (
    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
      {state === "saving" ? (
        <>
          <Loader2Icon className="size-3.5 animate-spin" /> Saving…
        </>
      ) : state === "saved" ? (
        <>
          <CheckIcon className="text-success size-3.5" /> Saved
        </>
      ) : state === "dirty" ? (
        <>
          <CloudUploadIcon className="size-3.5" /> Unsaved changes
        </>
      ) : state === "error" ? (
        <span className="text-destructive">Save failed — retrying on next change</span>
      ) : (
        <>Autosave on</>
      )}
    </span>
  );
}
