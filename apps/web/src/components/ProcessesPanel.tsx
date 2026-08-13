import type { RuntimeBackgroundProcess } from "@t3tools/client-runtime/state/backgroundProcesses";
import { CircleStop, SquareTerminal } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";

function elapsed(startedAt: string): string {
  const start = Date.parse(startedAt);
  if (Number.isNaN(start)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return `${seconds}s`;
  const hours = Math.floor(minutes / 60);
  if (hours === 0) return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
  return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function ProcessElapsed({ startedAt }: { startedAt: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const update = () => {
      if (ref.current) ref.current.textContent = elapsed(startedAt);
    };
    update();
    const id = window.setInterval(update, 1_000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  return <span ref={ref}>{elapsed(startedAt)}</span>;
}

export function ProcessesPanel({
  processes,
  isStopping,
  onStopAll,
}: {
  readonly processes: ReadonlyArray<RuntimeBackgroundProcess>;
  readonly isStopping: boolean;
  readonly onStopAll: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-border/70 border-b px-4">
        <div className="min-w-0">
          <div className="font-medium text-sm">Provider processes</div>
          <div className="text-muted-foreground text-xs">
            {processes.length === 0
              ? "No running commands"
              : `${processes.length} ${processes.length === 1 ? "command" : "commands"} running`}
          </div>
        </div>
        {processes.length > 0 ? (
          <Button size="xs" variant="outline" disabled={isStopping} onClick={onStopAll}>
            <CircleStop className="size-3.5" />
            {isStopping ? "Stopping..." : "Stop all"}
          </Button>
        ) : null}
      </div>

      {processes.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
          <SquareTerminal className="mb-3 size-5 text-muted-foreground" />
          <p className="font-medium text-sm">No provider processes are running</p>
          <p className="mt-1 max-w-xs text-muted-foreground text-xs leading-relaxed">
            Commands started by the coding agent appear here while their provider session owns them.
            User terminal tabs remain in the Terminal surface.
          </p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2 p-3">
            {processes.map((process) => (
              <div key={process.id} className="rounded-lg border border-border/70 bg-card p-3">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-info" aria-hidden />
                    <span className="font-medium text-xs">Running</span>
                  </div>
                  <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                    <ProcessElapsed startedAt={process.startedAt} />
                  </span>
                </div>
                <code className="mt-2 block break-words font-mono text-[12px] leading-relaxed">
                  {process.command}
                </code>
                {process.cwd || process.processId ? (
                  <div className="mt-2 flex min-w-0 items-center gap-2 text-muted-foreground text-[11px]">
                    {process.cwd ? <span className="min-w-0 truncate">{process.cwd}</span> : null}
                    {process.cwd && process.processId ? <span aria-hidden>·</span> : null}
                    {process.processId ? (
                      <span className="shrink-0">pid {process.processId}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
