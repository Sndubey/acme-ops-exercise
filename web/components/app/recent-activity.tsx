"use client";

import { useEffect, useState } from "react";

import { fetchRecentEvents } from "@/app/organizations/actions";
import { EmptyState } from "@/components/app/empty-state";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import type { ActivityEvent } from "@/lib/types";
import { formatDateTime, formatRelative } from "@/lib/utils";

const POLL_INTERVAL_MS = 5000;

export function RecentActivity({
  orgId,
  initialEvents,
}: {
  orgId: number;
  initialEvents: ActivityEvent[];
}) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (document.visibilityState !== "visible") return;
      const latest = await fetchRecentEvents(orgId);
      if (active && latest.length > 0) {
        setEvents(latest);
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orgId]);

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Recent activity</PanelTitle>
        <span className="legend">last {events.length}</span>
      </PanelHeader>

      <PanelBody className="px-0 py-0">
        {events.length === 0 ? (
          <EmptyState title="Nothing recorded for this tenant yet." />
        ) : (
          <ul>
            {events.map((event) => (
              <li
                key={event.id}
                className="row-flush border-b border-line-soft px-4 py-2.5 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <code className="font-mono text-[0.75rem] text-ink">{event.action}</code>
                  <span className="shrink-0 text-[0.6875rem] text-ink-faint">
                    {formatRelative(event.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.6875rem] text-ink-soft">
                  {event.actor_name ?? "System"} &middot; {formatDateTime(event.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </PanelBody>
    </Panel>
  );
}
