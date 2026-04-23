import { Zap, User } from "lucide-react";

const Navbar = () => {
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
        <button className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          Premium
        </button>
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
