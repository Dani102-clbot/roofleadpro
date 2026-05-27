import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
          <Button asChild className="shadow-[var(--shadow-glow)]"><Link to="/signup">Start Free</Link></Button>
        </div>
        <button
          aria-label="Menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95">
          <div className="container flex flex-col gap-1 py-3 text-sm">
            <a onClick={() => setOpen(false)} href="#features" className="rounded px-3 py-2 hover:bg-secondary">Features</a>
            <a onClick={() => setOpen(false)} href="#how" className="rounded px-3 py-2 hover:bg-secondary">How it works</a>
            <a onClick={() => setOpen(false)} href="#pricing" className="rounded px-3 py-2 hover:bg-secondary">Pricing</a>
            <a onClick={() => setOpen(false)} href="#faq" className="rounded px-3 py-2 hover:bg-secondary">FAQ</a>
            <div className="mt-2 flex gap-2 px-1">
              <Button variant="outline" className="flex-1" asChild><Link to="/login">Log in</Link></Button>
              <Button className="flex-1" asChild><Link to="/signup">Start Free</Link></Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
