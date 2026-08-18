import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";

/**
 * Plain GET form pointed at the API, so the browser handles the download and
 * nothing has to be buffered in the page.
 */
function ExportPanel({
  action,
  defaultFrom,
  defaultTo,
}: {
  action: string;
  defaultFrom: string;
  defaultTo: string;
}) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Export activity</PanelTitle>
      </PanelHeader>

      <PanelBody>
        <form method="get" action={action} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="legend mb-1 block">From</span>
              <Input type="date" name="from" defaultValue={defaultFrom} />
            </label>
            <label className="block">
              <span className="legend mb-1 block">To</span>
              <Input type="date" name="to" defaultValue={defaultTo} />
            </label>
          </div>

          <Button type="submit" variant="primary" size="sm" className="w-full">
            <Download className="size-3.5" />
            Download CSV
          </Button>
        </form>
      </PanelBody>
    </Panel>
  );
}

export { ExportPanel };
