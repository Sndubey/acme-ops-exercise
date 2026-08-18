import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

type Params = Record<string, string | undefined>;

function hrefFor(basePath: string, params: Params, page: number) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));

  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function Pagination({
  basePath,
  params,
  page,
  total,
  pageSize,
  noun = "results",
}: {
  basePath: string;
  params: Params;
  page: number;
  total: number;
  pageSize: number;
  noun?: string;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <>
      <p className="text-xs text-ink-soft">
        {total === 0 ? (
          <>No {noun}</>
        ) : (
          <>
            <span className="tabular text-ink">
              {formatNumber(first)}&ndash;{formatNumber(last)}
            </span>{" "}
            of <span className="tabular text-ink">{formatNumber(total)}</span> {noun}
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <span className="legend">
          page {page} / {lastPage}
        </span>

        {page <= 1 ? (
          <Button size="sm" disabled>
            Previous
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href={hrefFor(basePath, params, page - 1)}>Previous</Link>
          </Button>
        )}

        {page >= lastPage ? (
          <Button size="sm" disabled>
            Next
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href={hrefFor(basePath, params, page + 1)}>Next</Link>
          </Button>
        )}
      </div>
    </>
  );
}

export { Pagination };
