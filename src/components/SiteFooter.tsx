import { Logo } from "./Logo";

export const SiteFooter = () => (
  <footer className="border-t border-border/60 bg-secondary/30">
    <div className="container flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
      <div className="space-y-2">
        <Logo />
        <p className="text-sm text-muted-foreground">Roofing leads, on demand. Credits never expire.</p>
      </div>
      <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} RoofLeadPro. All rights reserved.</p>
    </div>
  </footer>
);
