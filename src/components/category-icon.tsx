"use client";

import { PHOSPHOR_ICON_MAP } from "@/lib/icons";

type Props = {
  icon: string;
  color?: string;
  size?: number;
};

export function CategoryIcon({ icon, color = "currentColor", size = 14 }: Props) {
  const name = icon.startsWith("phosphor:") ? icon.slice(9) : icon;
  const IconComponent = PHOSPHOR_ICON_MAP[name];
  if (!IconComponent) return null;
  return <IconComponent color={color} size={size} />;
}
