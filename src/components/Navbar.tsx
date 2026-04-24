import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ROLE_DASHBOARD: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN: "/admin",
  EMPLOYEE: "/dashboard",
};

const Navbar = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const handleProfileClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const dest = profile?.role ? ROLE_DASHBOARD[profile.role] : "/auth";
    navigate(dest ?? "/auth");
  };

  // Get initials for avatar
  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="h-12 border-b border-border flex items-center px-6 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">
          PM Arena
        </span>
      </div>

      <nav className="flex items-center gap-1 ml-8">
        {["Problems", "Explore", "Leaderboard"].map((item, i) => (
          <button
            key={item}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              i === 0
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {!user && (
          <button
            onClick={() => navigate("/auth")}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        )}
        <button
          onClick={handleProfileClick}
          title={user ? `Go to ${profile?.role?.replace("_", " ") ?? "dashboard"}` : "Sign in"}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all hover:ring-2 hover:ring-primary/50 hover:scale-105"
          style={{
            background: user
              ? "linear-gradient(135deg, #2563EB, #00C29A)"
              : "var(--muted)",
            color: user ? "#fff" : "var(--muted-foreground)",
          }}
        >
          {user ? initials : "?"}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
