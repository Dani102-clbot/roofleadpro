import { Link } from "react-router-dom";

export const Logo = ({ to = "/", compact = false }: { to?: string; compact?: boolean }) => (
  <Link to={to} className="flex items-center gap-2.5">
    <span
      aria-hidden
      className="h-7 w-7 bg-primary"
      style={{ clipPath: "polygon(50% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)" }}
    />
    {compact ? (
      <span className="font-mono text-[11px] font-bold uppercase text-muted-foreground" style={{ letterSpacing: "0.18em" }}>
        RoofLeads Pro
      </span>
    ) : (
      <span className="text-sm font-extrabold tracking-tight text-foreground">RoofLeads Pro</span>
    )}
  </Link>
);
