# Tickets

Pulled from the current sprint. **Do the ones we named in your email** — you
were not assigned all of these.

Read [README.md](./README.md) first if you have not. Record decisions and
trade-offs in [DECISIONS.md](./DECISIONS.md) as you go.

---

## ACME-412 — Invite several members at once

**Type:** Feature · **Reported by:** Priya (Support Lead)

> When a customer onboards a new team we currently add people one at a time
> through the customer's own settings screen, which means a support call per
> person. We want to paste in a list of email addresses and send the invitations
> ourselves.

**Acceptance criteria**

- From an organization's page, an operator can invite one or more people by
  email address and choose the role they get.
- Invited people show up in the members list straight away with status
  `invited`.
- The invitations are recorded in the activity log.
- Addresses that are already members of that organization are handled sensibly.
- Only operators who are allowed to manage members can do this.

**Notes**

- No schema change is needed for this.
- Priya was clear about the happy path and vague about everything else. Use your
  judgment and write down what you decided.

---

## ACME-431 — Activity CSV is missing rows

**Type:** Bug · **Reported by:** Support (escalated) · **Customer:** Northwind Trading Co.

> Northwind pulled an activity export for their compliance review and say the
> file does not match what the console shows them. They counted noticeably fewer
> rows in the CSV than the console reports for the same account.
>
> They also sent a screenshot of the same event appearing twice in one file.
>
> It does not happen every time — one of their analysts re-ran the same export
> and got a different number of rows out. We have not had this from any smaller
> customer.

**What we need**

1. The root cause, written down in plain language. What is actually going wrong.
2. A fix.
3. A test that fails before your fix and passes after it.

If you find more than one thing wrong here, tell us about all of them, even the
ones you choose not to fix.

---

## ACME-455 — The overview page is too slow

**Type:** Performance · **Reported by:** Dana (Ops)

> The dashboard takes the better part of ten seconds to come up. It is the first
> thing we open in the morning and the whole team sits there waiting for it.
> It did not used to be like this.

That is the whole ticket. Dana did not give us acceptance criteria and is on
leave this week.

---

## ACME-460 — Live activity feed, and tidy up reports

**Type:** Improvement · **Reported by:** Dana (Ops)

> Two things while you are in there:
>
> 1. The activity panel on an organization's page should update by itself. We
>    sit with it open during an incident and keep hitting refresh.
> 2. The reports module is old and does not look like the rest of the codebase.
>    Please move it onto the new query helper.

---

## Handing back

A commit per ticket, each with a short description covering what you changed,
why, and anything you deliberately left alone.
