// Twistor-owned UI wrapper layer — the Astryx adoption boundary (TW-150).
//
// SWIZZLE BOUNDARY: interactive-surface pages import THESE modules, never
// '@astryxdesign/core' directly. Every file in this directory owns a small,
// Twistor-named prop API and delegates rendering to Astryx today.
//
// To exit Astryx (swizzle rip-out, see docs/astryx-adoption.md): reimplement
// each file's internals — swizzle the component source with the Astryx CLI or
// hand-roll a replacement — without touching any call site. The exported prop
// types in this directory are the contract that must stay stable.
//
// Enforced by `npm run guard`.
import {Button as AstryxButton} from '@astryxdesign/core';

export type TwButtonVariant = 'primary' | 'secondary' | 'tertiary';

export interface TwButtonProps {
  label: string;
  variant?: TwButtonVariant;
  isDisabled?: boolean;
  /** Called on click. Never performs network I/O itself — surfaces own that. */
  onPress?: () => void;
}

/** Twistor primary/secondary/tertiary action button. Renders a real <button>. */
export function TwButton({label, variant = 'primary', isDisabled, onPress}: TwButtonProps) {
  return (
    <AstryxButton
      label={label}
      variant={variant}
      isDisabled={isDisabled}
      clickAction={onPress ? () => onPress() : undefined}
    />
  );
}
