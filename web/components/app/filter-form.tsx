"use client";

import { useRef } from "react";

/**
 * A plain GET form, so filters live in the URL and survive a reload or a shared
 * link. Selects apply as soon as they change; the text box waits for Enter.
 */
function FilterForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      method="get"
      className={className}
      onChange={(event) => {
        if ((event.target as HTMLElement).tagName === "SELECT") {
          ref.current?.requestSubmit();
        }
      }}
    >
      {children}
    </form>
  );
}

export { FilterForm };
