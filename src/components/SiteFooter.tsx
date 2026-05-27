import { Logo } from "./Logo";

export const SiteFooter = () => (
  <footer className="border-t border-border">
    <div className="mx-auto flex max-w-[1000px] flex-col items-start justify-between gap-6 px-5 py-8 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <Logo />
      </div>
      <div className="flex flex-wrap gap-5 font-mono text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground">Privacy</a>
        <a href="#" className="hover:text-foreground">Terms</a>
        <a href="#" className="hover:text-foreground">Contact</a>
      </div>
      <p className="font-mono text-xs text-muted-foreground">© {new Date().getFullYear()} RoofLeads Pro</p>
    </div>
  </footer>
);
