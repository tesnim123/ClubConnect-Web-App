// components/Sidebar.tsx
import { Link } from "react-router";
import { Home, Calendar, MessageSquare, Users, Settings, BarChart3, Building2, MessagesSquare } from "lucide-react";
import { cn } from "../components/ui/utils";

interface SidebarProps {
  role: 'member' | 'staff' | 'admin';
  collapsed?: boolean;
}

export function Sidebar({ role, collapsed = false }: SidebarProps) {
  const memberLinks = [
    { to: "/member/dashboard", icon: Home, label: "Accueil" },
    { to: "/member/events", icon: Calendar, label: "Événements" },
    { to: "/member/chat", icon: MessageSquare, label: "Chat" },
    { to: "/member/forum", icon: Users, label: "Forum" },
    { to: "/member/profile", icon: Settings, label: "Profil" },
  ];

  const staffLinks = [
    { to: "/staff/dashboard", icon: Home, label: "Tableau de bord" },
    { to: "/staff/events", icon: Calendar, label: "Événements" },
    { to: "/staff/members", icon: Users, label: "Membres" },
    { to: "/staff/channels", icon: MessageSquare, label: "Canaux" },
    { to: "/member/profile", icon: Settings, label: "Profil" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: Home, label: "Tableau de bord" },
    { to: "/admin/clubs", icon: Building2, label: "Clubs" },
    { to: "/admin/events", icon: Calendar, label: "Événements" },
    { to: "/admin/members", icon: Users, label: "Membres" },
    { to: "/admin/forums", icon: MessagesSquare, label: "Forums" }, // Nouveau lien pour les forums
    { to: "/admin/statistics", icon: BarChart3, label: "Statistiques" },
    { to: "/admin/communication", icon: MessageSquare, label: "Communication" },
  ];

  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : memberLinks;

  return (
    <aside
      className={cn(
        "bg-[#1B2A4A] text-white transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="p-4 border-b border-[#2D3E5F]">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0EA8A8] flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg">ClubConnect</h2>
              <p className="text-xs text-gray-400">Connectez. Créez.</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2D3E5F] transition-colors group"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
              {collapsed && (
                <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2D3E5F]">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2D3E5F] transition-colors">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Paramètres</span>}
        </button>
      </div>
    </aside>
  );
}