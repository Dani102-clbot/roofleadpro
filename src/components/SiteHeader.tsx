import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass">
      <div className="mx-auto flex h-[58px] max-w-[1000px] items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "#features", label: "Features" },
            { href: "#how", label: "How it works" },
            { href: "#pricing", label: "Pricing" },
          ].map(l => (
            <a key={l.href} href={l.href} className="rounded px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Link to="/login" className="rounded px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Log in
          </Link>
          <Link
            to="/signup"
            className="ml-2 rounded bg-primary px-4 py-2 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-hover))]"
            style={{ letterSpacing: "0.04em" }}
          >
            Get started
          </Link>
        </nav>
        <button
          aria-label="Menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background/95 md:hidden">
          <div className="mx-auto flex max-w-[1000px] flex-col gap-1 px-5 py-3 text-sm">
            <a onClick={() => setOpen(false)} href="#features" className="rounded px-3 py-2 hover:bg-secondary">Features</a>
            <a onClick={() => setOpen(false)} href="#how" className="rounded px-3 py-2 hover:bg-secondary">How it works</a>
            <a onClick={() => setOpen(false)} href="#pricing" className="rounded px-3 py-2 hover:bg-secondary">Pricing</a>
            <div className="mt-2 flex gap-2 px-1">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded border border-border px-3 py-2 text-center text-sm font-semibold">Log in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded bg-primary px-3 py-2 text-center text-sm font-bold text-primary-foreground">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
