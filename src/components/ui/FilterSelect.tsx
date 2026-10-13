// Twistor-owned UI wrapper layer — the Astryx adoption boundary (TW-150).
// See TwButton.tsx for the boundary contract.
import {Selector as AstryxSelector} from '@astryxdesign/core';

export interface FilterSelectProps {
  /** Accessible label — always rendered, never hidden. */
  label: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  name?: string;
}

/** Dropdown filter. Plain-string options; controlled by the surface. */
export function FilterSelect({label, options, value, onSelect, name}: FilterSelectProps) {
  return (
    <AstryxSelector
      label={label}
      name={name}
      options={options}
      value={value}
      onChange={(v) => onSelect(v)}
    />
  );
}
