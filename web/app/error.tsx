"use client";

import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Panel className="mx-auto max-w-xl">
      <PanelHeader>
        <PanelTitle>This screen didn&rsquo;t load</PanelTitle>
      </PanelHeader>

      <PanelBody className="space-y-4 py-5">
        <p className="text-sm leading-relaxed text-ink-soft">{error.message}</p>

        <div className="surface-well rounded-md px-3 py-2.5">
          <p className="legend mb-1.5">Usual cause</p>
          <p className="text-xs leading-relaxed text-ink-soft">
            The API or the database is not running. From the repository root:{" "}
            <code className="font-mono text-ink">docker compose up -d</code>, then{" "}
            <code className="font-mono text-ink">npm run dev</code>.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={reset}>
          Try again
        </Button>
      </PanelBody>
    </Panel>
  );
}
