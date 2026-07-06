"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  FileText,
  SearchIcon,
  Target,
  User,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface SearchResult {
  patients: { id: string; name: string; mrn: string }[];
  documents: { id: string; title: string; patient: string }[];
  assessments: { id: string; template: string; patient: string }[];
  goals: { id: string; description: string; patient: string; planId: string; patientId: string }[];
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data } = useQuery<SearchResult>({
    queryKey: ["global-search", query],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("search failed");
      return res.json();
    },
    enabled: open && query.trim().length >= 2,
    staleTime: 10_000,
  });

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    data &&
    (data.patients.length ||
      data.documents.length ||
      data.assessments.length ||
      data.goals.length);

  return (
    <>
      <Button
        variant="outline"
        className="text-muted-foreground w-full max-w-64 justify-start gap-2 font-normal sm:w-64"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
        Search everything…
        <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto hidden rounded border px-1.5 font-mono text-[10px] sm:inline-block">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search patients, documents, assessments, goals…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.trim().length < 2 ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              Type at least 2 characters to search.
            </div>
          ) : !hasResults ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <>
              {data.patients.length > 0 && (
                <CommandGroup heading="Patients">
                  {data.patients.map((p) => (
                    <CommandItem key={p.id} onSelect={() => go(`/patients/${p.id}`)}>
                      <User />
                      {p.name}
                      <span className="text-muted-foreground ml-auto text-xs">{p.mrn}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {data.documents.length > 0 && (
                <CommandGroup heading="Documents">
                  {data.documents.map((d) => (
                    <CommandItem key={d.id} onSelect={() => go(`/documents/${d.id}`)}>
                      <FileText />
                      {d.title}
                      <span className="text-muted-foreground ml-auto text-xs">{d.patient}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {data.assessments.length > 0 && (
                <CommandGroup heading="Assessments">
                  {data.assessments.map((a) => (
                    <CommandItem key={a.id} onSelect={() => go(`/assessments/${a.id}`)}>
                      <ClipboardList />
                      {a.template}
                      <span className="text-muted-foreground ml-auto text-xs">{a.patient}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {data.goals.length > 0 && (
                <CommandGroup heading="Goals">
                  {data.goals.map((g) => (
                    <CommandItem key={g.id} onSelect={() => go(`/patients/${g.patientId}?tab=plan`)}>
                      <Target />
                      <span className="truncate">{g.description}</span>
                      <span className="text-muted-foreground ml-auto text-xs">{g.patient}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
