import * as DateTime from "effect/DateTime";
import * as Option from "effect/Option";
import { ActivityIcon, CpuIcon, MemoryStickIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { useSystemVitals } from "../../lib/systemVitalsState";
import { usePrimaryEnvironment } from "../../state/environments";
import { Button } from "../ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = units[0]!;
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index]!;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

function percent(used: number, total: number): number {
  return total <= 0 ? 0 : Math.max(0, Math.min(100, (used / total) * 100));
}

function formatUptime(milliseconds: number): string {
  const totalHours = Math.floor(milliseconds / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

function MetricBar({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{detail}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function EnvironmentHealthPopover() {
  const environment = usePrimaryEnvironment();
  const vitals = useSystemVitals(environment?.environmentId ?? null);
  const snapshot = vitals.data;
  const hostCpu = snapshot ? Option.getOrNull(snapshot.host.cpuPercent) : null;
  const hostUsed = snapshot ? Option.getOrNull(snapshot.host.usedMemoryBytes) : null;
  const hostTotal = snapshot ? Option.getOrNull(snapshot.host.totalMemoryBytes) : null;
  const uptime = snapshot ? Option.getOrNull(snapshot.host.uptimeMs) : null;
  const memoryPercent =
    hostUsed !== null && hostTotal !== null ? percent(hostUsed, hostTotal) : null;
  const available = hostCpu !== null || memoryPercent !== null;

  if (environment === null) return null;

  return (
    <SidebarMenuItem className="min-w-0 flex-1">
      <Popover>
        <PopoverTrigger
          render={
            <SidebarMenuButton aria-label="Environment health" className="min-w-0">
              <ActivityIcon />
              <span className="min-w-0 flex-1 truncate">{environment.label}</span>
              {available ? (
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                  <span
                    aria-label={`CPU ${hostCpu === null ? "unavailable" : `${hostCpu.toFixed(0)}%`}`}
                    className="flex items-center gap-0.5"
                  >
                    <CpuIcon aria-hidden="true" className="size-3" />
                    {hostCpu === null ? "—" : `${hostCpu.toFixed(0)}%`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    aria-label={`Memory ${memoryPercent === null ? "unavailable" : `${memoryPercent.toFixed(0)}%`}`}
                    className="flex items-center gap-0.5"
                  >
                    <MemoryStickIcon aria-hidden="true" className="size-3" />
                    {memoryPercent === null ? "—" : `${memoryPercent.toFixed(0)}%`}
                  </span>
                </span>
              ) : null}
            </SidebarMenuButton>
          }
        />
        <PopoverPopup align="start" className="w-80 max-w-[calc(100vw-2rem)]" side="top">
          <div className="space-y-4 p-3">
            <div>
              <div className="text-sm font-medium">{environment.label}</div>
              <div className="text-xs text-muted-foreground">
                {available
                  ? `Host metrics · ${snapshot?.health.status ?? "unknown"}`
                  : (vitals.error ?? "Host metrics are unavailable for this environment.")}
              </div>
            </div>
            {hostCpu !== null ? (
              <MetricBar label="Host CPU" value={hostCpu} detail={`${hostCpu.toFixed(1)}%`} />
            ) : null}
            {memoryPercent !== null && hostUsed !== null && hostTotal !== null ? (
              <MetricBar
                label="Host memory"
                value={memoryPercent}
                detail={`${formatBytes(hostUsed)} / ${formatBytes(hostTotal)}`}
              />
            ) : null}
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/70 p-2.5 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CpuIcon className="size-3.5" /> T3 CPU
              </div>
              <div className="text-right font-mono tabular-nums">
                {snapshot ? `${snapshot.t3.currentCpuPercent.toFixed(1)}%` : "—"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MemoryStickIcon className="size-3.5" /> T3 memory
              </div>
              <div className="text-right font-mono tabular-nums">
                {snapshot ? formatBytes(snapshot.t3.currentRssBytes) : "—"}
              </div>
              <div className="text-muted-foreground">Host uptime</div>
              <div className="text-right font-mono tabular-nums">
                {uptime === null ? "—" : formatUptime(uptime)}
              </div>
              <div className="text-muted-foreground">Last sample</div>
              <div className="text-right font-mono tabular-nums">
                {snapshot ? DateTime.format(snapshot.readAt, { timeStyle: "medium" }) : "—"}
              </div>
            </div>
            <Button render={<Link to="/settings/diagnostics" />} size="sm" variant="outline">
              Open diagnostics
            </Button>
          </div>
        </PopoverPopup>
      </Popover>
    </SidebarMenuItem>
  );
}
