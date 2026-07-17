import Link from "next/link";
import Wordmark from "@/components/public/Wordmark";

export default function NotFound() {
  return (
    <main className="hero-glow flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Link href="/" className="mb-10">
        <Wordmark size="md" />
      </Link>

      <p className="font-display text-7xl font-extrabold tracking-tight text-accent-bright sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
        This road doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        The page you&apos;re looking for was moved or never existed. Let&apos;s
        get you back on route.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn btn-primary px-7 py-3.5 text-sm">
          Back to home
        </Link>
        <Link href="/#fleet" className="btn btn-ghost px-6 py-3.5 text-sm">
          Browse the fleet
        </Link>
      </div>
    </main>
  );
}
