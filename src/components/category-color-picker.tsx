"use client";

import { useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

type Props = {
  name?: string;
  defaultColor?: string;
};

const PRESET_COLORS = [
  "#37A8A4",
  "#D86F33",
  "#3B82F6",
  "#7C3AED",
  "#DC2626",
  "#EAB308",
  "#14B8A6",
  "#4F46E5",
  "#8A94A6",
  "#16A34A",
  "#F97316",
  "#0EA5E9",
];

function normalizeHex(input: string): string {
  const value = input.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(value)) {
    return value;
  }
  return "#37A8A4";
}

export function CategoryColorPicker({ name = "color", defaultColor = "#37A8A4" }: Props) {
  const initial = useMemo(() => normalizeHex(defaultColor), [defaultColor]);
  const [color, setColor] = useState(initial);
  const [hexInput, setHexInput] = useState(initial);

  function onHexBlur() {
    const normalized = normalizeHex(hexInput);
    setColor(normalized);
    setHexInput(normalized);
  }

  return (
    <div className="color-picker-wrap">
      <input type="hidden" name={name} value={color} />

      <div className="color-picker-header">
        <span className="color-preview" style={{ backgroundColor: color }} />
        <input
          value={hexInput}
          onChange={(event) => setHexInput(event.currentTarget.value)}
          onBlur={onHexBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onHexBlur();
            }
          }}
          placeholder="#37A8A4"
          maxLength={7}
        />
      </div>

      <HexColorPicker
        color={color}
        onChange={(next) => {
          const normalized = next.toUpperCase();
          setColor(normalized);
          setHexInput(normalized);
        }}
      />

      <div className="color-presets" role="group" aria-label="Cores sugeridas">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`color-preset ${color === preset ? "color-preset-active" : ""}`}
            style={{ backgroundColor: preset }}
            onClick={() => {
              setColor(preset);
              setHexInput(preset);
            }}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
}
