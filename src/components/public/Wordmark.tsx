import Image from "next/image";

/**
 * Apex brand lockup: mountain mark + a two-line "APEX / RENTALS" stack.
 * `size` scales the whole lockup; used in the navbar (sm) and footer (md).
 */
export default function Wordmark({ size = "sm" }: { size?: "sm" | "md" }) {
  const markH = size === "md" ? "h-10" : "h-9";
  const apex = size === "md" ? "text-[22px]" : "text-[20px]";
  const rentals = size === "md" ? "text-[10px]" : "text-[9px]";

  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/apex-mark.png"
        alt="Apex Rentals"
        width={600}
        height={331}
        priority={size === "sm"}
        className={`logo-mark ${markH} w-auto`}
      />
      <span className="flex flex-col leading-none">
        <span className={`font-wordmark ${apex} font-bold uppercase tracking-[0.3em] text-fg`}>
          Apex
        </span>
        <span className={`mt-1 font-wordmark ${rentals} font-semibold uppercase tracking-[0.46em] text-accent-bright`}>
          Rentals
        </span>
      </span>
    </span>
  );
}
