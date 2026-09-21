// Twistor-owned UI wrapper layer — the Astryx adoption boundary (TW-150).
// See TwButton.tsx for the boundary contract.
import {TextInput as AstryxTextInput} from '@astryxdesign/core';

export interface SearchInputProps {
  /** Accessible label — always rendered, never hidden. */
  label: string;
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  name?: string;
}

/** Filter/search field. Controlled; surfaces own the filtering. */
export function SearchInput({label, value, onSearch, placeholder, name}: SearchInputProps) {
  return (
    <AstryxTextInput
      label={label}
      name={name}
      type="text"
      value={value}
      onChange={(v) => onSearch(v)}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}
