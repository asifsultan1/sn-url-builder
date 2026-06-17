import { Info } from "lucide-react";

interface Props {
  text: string;
  /** tooltip alignment relative to the icon. */
  align?: "left" | "center" | "right";
}

/** Small hover-for-help icon with a styled tooltip. */
export function InfoTip({ text, align = "center" }: Props) {
  const pos =
    align === "left"
      ? "left-0"
      : align === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";
  return (
    <span className="relative inline-flex align-middle group/info">
      <Info
        size={13}
        className="text-gray-400 hover:text-gray-600 cursor-help"
        aria-hidden
      />
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full z-30 mt-1 hidden w-60 rounded-md bg-gray-900 px-2.5 py-2 text-[11px] font-normal normal-case leading-snug text-white shadow-lg group-hover/info:block ${pos}`}
      >
        {text}
      </span>
    </span>
  );
}
