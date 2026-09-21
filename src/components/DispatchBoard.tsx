// Dispatch board — first adopted Astryx interactive surface (TW-150, branch
// rollout/tw-150-astryx). Renders only inside /surfaces/dispatch-board.
//
// SAMPLE DATA ONLY: every job below is fictional. The real jobs API contract
// belongs to Dre (ticket TW-152) and does not exist yet — this board performs
// zero network I/O; status changes are local UI state for the adoption demo.
//
// All Astryx usage goes through src/components/ui (the swizzle boundary);
// this file only imports Twistor's wrapper components, never the vendor
// design-system package directly.
import {useMemo, useState} from 'react';
import {
  TwButton,
  TwCard,
  StatusBadge,
  PriorityBadge,
  SearchInput,
  FilterSelect,
  NoticeBanner,
  type JobStatus,
} from './ui';

interface Job {
  id: string;
  customer: string;
  address: string;
  summary: string;
  window: string;
  priority: 'P1' | 'P2' | 'P3';
  status: JobStatus;
  tech: string;
}

const SAMPLE_JOBS: Job[] = [
  {
    id: 'job-101',
    customer: 'Sunny Side Café',
    address: '4120 Fictional Ave, Denver CO',
    summary: 'AC not cooling the dining room',
    window: '8:00–10:00 AM',
    priority: 'P1',
    status: 'urgent',
    tech: 'Sam Rivera',
  },
  {
    id: 'job-102',
    customer: 'Riverside Apartments 4B',
    address: '88 Example Blvd, Denver CO',
    summary: 'Furnace short-cycling overnight',
    window: '10:00 AM–12:00 PM',
    priority: 'P2',
    status: 'en-route',
    tech: 'Jordan Lee',
  },
  {
    id: 'job-103',
    customer: 'Maple & Main Bakery',
    address: '2300 Sample St, Denver CO',
    summary: 'Walk-in freezer temperature alarm',
    window: '10:00 AM–12:00 PM',
    priority: 'P1',
    status: 'on-site',
    tech: 'Alex Chen',
  },
  {
    id: 'job-104',
    customer: 'Harbor Dental',
    address: '77 Mockingbird Ln, Denver CO',
    summary: 'Annual HVAC maintenance visit',
    window: '1:00–3:00 PM',
    priority: 'P3',
    status: 'scheduled',
    tech: 'Casey Brooks',
  },
  {
    id: 'job-105',
    customer: 'Bluebird Books',
    address: '15 Demo Way, Denver CO',
    summary: 'Thermostat unresponsive since Friday',
    window: '1:00–3:00 PM',
    priority: 'P2',
    status: 'scheduled',
    tech: 'Alex Chen',
  },
  {
    id: 'job-106',
    customer: 'Cedar Park School',
    address: '900 Placeholder Rd, Denver CO',
    summary: 'Rooftop unit filter swap',
    window: '8:00–10:00 AM',
    priority: 'P3',
    status: 'complete',
    tech: 'Sam Rivera',
  },
];

const STATUS_FILTERS = ['All statuses', 'urgent', 'scheduled', 'en-route', 'on-site', 'complete'] as const;

const NEXT_STATUS: Record<JobStatus, JobStatus | null> = {
  urgent: 'en-route',
  scheduled: 'en-route',
  'en-route': 'on-site',
  'on-site': 'complete',
  complete: null,
};

const ADVANCE_LABEL: Record<JobStatus, string> = {
  urgent: 'Dispatch tech',
  scheduled: 'Dispatch tech',
  'en-route': 'Mark on site',
  'on-site': 'Complete job',
  complete: 'Done',
};

function matches(job: Job, query: string, statusFilter: string): boolean {
  const q = query.trim().toLowerCase();
  const hit =
    q === '' ||
    job.customer.toLowerCase().includes(q) ||
    job.address.toLowerCase().includes(q) ||
    job.summary.toLowerCase().includes(q) ||
    job.tech.toLowerCase().includes(q);
  const statusOk = statusFilter === 'All statuses' || job.status === statusFilter;
  return hit && statusOk;
}

export default function DispatchBoard() {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All statuses');

  const visible = useMemo(
    () => jobs.filter((j) => matches(j, query, statusFilter)),
    [jobs, query, statusFilter],
  );

  const advance = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        const next = NEXT_STATUS[j.status];
        return j.id === id && next ? {...j, status: next} : j;
      }),
    );
  };

  return (
    <div className="board-stack">
      <NoticeBanner
        title="Adoption surface — sample data only"
        description="Built on Astryx through Twistor's ui/ wrapper layer (TW-150). Job data is fictional; the production jobs API contract is ticketed to Dre (TW-152). Status changes here update local UI state only — nothing is sent anywhere."
      />

      <section aria-labelledby="board-heading">
        <h2 id="board-heading">Today&rsquo;s jobs</h2>
        <div className="board-filters" role="search" aria-label="Filter jobs">
          <SearchInput
            label="Search jobs"
            name="job-search"
            value={query}
            onSearch={setQuery}
            placeholder="Customer, address, or tech…"
          />
          <FilterSelect
            label="Status"
            name="status-filter"
            options={[...STATUS_FILTERS]}
            value={statusFilter}
            onSelect={setStatusFilter}
          />
        </div>

        <p role="status" className="board-count">
          Showing {visible.length} of {jobs.length} jobs
        </p>

        {visible.length === 0 ? (
          <p className="board-empty">
            No jobs match this filter. Clear the search or pick a different status.
          </p>
        ) : (
          <ul className="board-grid">
            {visible.map((job) => {
              const next = NEXT_STATUS[job.status];
              return (
                <li key={job.id}>
                  <TwCard>
                    <article aria-labelledby={`${job.id}-customer`} className="job-card">
                      <div className="job-badges">
                        <StatusBadge status={job.status} />
                        <PriorityBadge priority={job.priority} />
                      </div>
                      <h3 id={`${job.id}-customer`}>{job.customer}</h3>
                      <p className="job-summary">{job.summary}</p>
                      <dl className="job-meta">
                        <div>
                          <dt>Address</dt>
                          <dd>{job.address}</dd>
                        </div>
                        <div>
                          <dt>Window</dt>
                          <dd>{job.window}</dd>
                        </div>
                        <div>
                          <dt>Tech</dt>
                          <dd>{job.tech}</dd>
                        </div>
                        <div>
                          <dt>Priority</dt>
                          <dd>{job.priority === 'P1' ? 'P1 (urgent)' : job.priority}</dd>
                        </div>
                      </dl>
                      {next ? (
                        <TwButton
                          label={ADVANCE_LABEL[job.status]}
                          variant={job.status === 'urgent' ? 'primary' : 'secondary'}
                          onPress={() => advance(job.id)}
                        />
                      ) : (
                        <p className="job-done">Finished — no further action.</p>
                      )}
                    </article>
                  </TwCard>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
