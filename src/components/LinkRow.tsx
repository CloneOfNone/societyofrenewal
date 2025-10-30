import Link from "next/link";

import { cn } from "@/lib/utils";

const resources = [
  {
    href: "https://renewal.wiki",
    label: "Read the Charter →",
  },
  {
    href: "https://societyofrenewal.org/founding-document",
    label: "Explore the Founding Document →",
  },
  {
    href: "https://github.com/CloneOfNone/essentia/blob/main/docs/whitepaper.md",
    label: "Whitepaper v0.6.0 →",
  },
];

export default function LinkRow() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
      {resources.map((resource) => (
        <Link
          key={resource.href}
          href={resource.href}
          target="_blank"
          rel="noopener"
          className={cn(
            "group relative inline-flex items-center gap-2 font-medium transition-colors duration-200",
            "text-slate-400 hover:text-slate-100 focus-visible:text-slate-100",
          )}
        >
          <span className="relative">
            {resource.label}
            <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-slate-300/60 transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
          </span>
        </Link>
      ))}
    </div>
  );
}
