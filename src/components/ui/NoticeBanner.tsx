// Twistor-owned UI wrapper layer — the Astryx adoption boundary (TW-150).
// See TwButton.tsx for the boundary contract.
import {Banner as AstryxBanner} from '@astryxdesign/core';

export interface NoticeBannerProps {
  title: string;
  description?: string;
}

/** Non-dismissible informational banner. Pinned open — no collapse toggle. */
export function NoticeBanner({title, description}: NoticeBannerProps) {
  return (
    <AstryxBanner
      status="info"
      title={title}
      description={description}
      collapsible={false}
    />
  );
}
