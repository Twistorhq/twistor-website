// Twistor-owned UI wrapper layer — the Astryx adoption boundary (TW-150).
// See TwButton.tsx for the boundary contract.
import {Badge as AstryxBadge, type BadgeVariant} from '@astryxdesign/core';

/** Twistor's dispatch vocabulary — never Astryx's variant names at call sites. */
export type JobStatus = 'scheduled' | 'en-route' | 'on-site' | 'complete' | 'urgent';

const STATUS_META: Record<JobStatus, {variant: BadgeVariant; label: string}> = {
  scheduled: {variant: 'info', label: 'Scheduled'},
  'en-route': {variant: 'blue', label: 'En route'},
  'on-site': {variant: 'warning', label: 'On site'},
  complete: {variant: 'success', label: 'Complete'},
  urgent: {variant: 'error', label: 'Urgent'},
};

export interface StatusBadgeProps {
  status: JobStatus;
}

/** Job-status pill in Twistor dispatch language. */
export function StatusBadge({status}: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return <AstryxBadge variant={meta.variant} label={meta.label} />;
}

/** Priority pill: only P1 gets a pill; P2/P3 render as plain text at the call site. */
export function PriorityBadge({priority}: {priority: 'P1' | 'P2' | 'P3'}) {
  if (priority !== 'P1') return null;
  return <AstryxBadge variant="error" label="P1 urgent" />;
}
