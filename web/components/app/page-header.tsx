function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {eyebrow ? <p className="legend">{eyebrow}</p> : null}
        <h1 className="etched mt-1.5 text-[1.6rem] font-semibold leading-none tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-ink-soft">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export { PageHeader };
