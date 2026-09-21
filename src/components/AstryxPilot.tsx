// Astryx design-system pilot island (TW-140 evaluation, branch sofia/tw-140-astryx).
// Renders only inside /demo/astryx-pilot. No live page imports this component.
import {useState} from 'react';
import {
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Card,
  Badge,
  TextInput,
  TextArea,
  Selector,
  Banner,
  Field,
} from '@astryxdesign/core';

const PRODUCTS = [
  {
    name: 'Trades AI Front Office',
    tagline: 'Every call answered. Every urgent job triaged.',
    blurb:
      'For HVAC, plumbing, roofing, and electrical shops: AI reception that triages urgency and posts jobs straight to your dispatch board.',
    badge: 'HVAC-first',
  },
  {
    name: 'Dental AI Front Office',
    tagline: 'Never lose a patient to voicemail again.',
    blurb:
      'AI answers every call, confirms appointments, and texts back missed calls in under a minute — with a monthly report showing recovered revenue.',
    badge: 'Coming soon',
  },
  {
    name: 'Dispatch OS',
    tagline: 'One board that runs your phones and your schedule.',
    blurb:
      'Jobs arrive by phone, email, or web. AI answers, triages, schedules, and confirms — while you watch a single dispatch board.',
    badge: 'Flagship',
  },
];

const BUSINESS_TYPES = [
  'HVAC shop',
  'Plumbing shop',
  'Electrical shop',
  'Roofing company',
  'Dental practice',
  'Other local business',
];

export default function AstryxPilot() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="pilot-stack">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/demo/astryx-pilot">Design evaluations</BreadcrumbItem>
        <BreadcrumbItem>Astryx pilot</BreadcrumbItem>
      </Breadcrumbs>

      <section aria-labelledby="buttons-heading">
        <h2 id="buttons-heading">Buttons</h2>
        <p>
          Primary and secondary actions use the Twistor accent token, overridden
          from Astryx&rsquo;s neutral theme on this page — no fork, no wrapper.
        </p>
        <div className="pilot-row">
          <Button label="Book a demo" clickAction={() => {}} />
          <Button label="See the products" variant="secondary" clickAction={() => {}} />
          <Button label="Talk to sales" variant="tertiary" clickAction={() => {}} />
          <Button label="Disabled state" isDisabled clickAction={() => {}} />
        </div>
      </section>

      <section aria-labelledby="form-heading">
        <h2 id="form-heading">Request-a-demo form</h2>
        <p>
          Labels are required by the component API and always rendered — the
          accessible name comes for free, not as an afterthought.
        </p>
        {submitted && (
          <Banner
            status="success"
            title="Pilot received — this is a UI evaluation"
            description="Nothing was sent anywhere. In production this form would need Dre's lead-capture API contract; that contract does not exist yet."
          />
        )}
        <form
          className="pilot-stack"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <Field>
            <TextInput
              label="Full name"
              name="name"
              isRequired
              autoComplete="name"
              placeholder="e.g. Maria Delgado"
            />
          </Field>
          <Field>
            <TextInput
              label="Shop phone"
              name="phone"
              type="tel"
              isRequired
              autoComplete="tel"
              description="The number your customers already call."
              placeholder="(303) 555-0148"
            />
          </Field>
          <Field>
            <Selector
              label="Business type"
              name="business-type"
              isRequired
              options={BUSINESS_TYPES}
            />
          </Field>
          <Field>
            <TextArea
              label="What eats your front desk's time?"
              name="notes"
              isOptional
              description="Missed calls, scheduling chaos, no-shows — give us the honest version."
              placeholder="e.g. We miss calls every Saturday and nobody follows up."
            />
          </Field>
          <div className="pilot-row">
            <Button label="Request my demo" clickAction={() => setSubmitted(true)} />
          </div>
        </form>
      </section>

      <section aria-labelledby="cards-heading">
        <h2 id="cards-heading">Product cards</h2>
        <p>
          The same three product lines from twistor.co&rsquo;s homepage, rendered
          as Astryx cards under Twistor brand tokens.
        </p>
        <div className="pilot-grid">
          {PRODUCTS.map((p) => (
            <Card key={p.name}>
              <div className="pilot-stack">
                <Badge>{p.badge}</Badge>
                <h3>{p.name}</h3>
                <p className="pilot-tagline">{p.tagline}</p>
                <p>{p.blurb}</p>
                <Button label={`Explore ${p.name}`} variant="secondary" clickAction={() => {}} />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
