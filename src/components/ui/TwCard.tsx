// Twistor-owned UI wrapper layer — the Astryx adoption boundary (TW-150).
// See TwButton.tsx for the boundary contract.
import {Card as AstryxCard} from '@astryxdesign/core';
import type {ReactNode} from 'react';

export interface TwCardProps {
  children: ReactNode;
}

/** Twistor surface card. Renders a <div> region; surfaces supply the heading. */
export function TwCard({children}: TwCardProps) {
  return <AstryxCard>{children}</AstryxCard>;
}
