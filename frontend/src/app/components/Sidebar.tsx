// components/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router";
import {
  BarChart3,
  Building2,
  Calendar,
  Home,
  MessageSquare,
  MessagesSquare,
  Settings,
  ShieldCheck,
  Users,
  User,
  Bell,
  PlusCircle,
  UserPlus,
  Hash,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useState, useEffect } from "react";

interface SidebarProps {
  role: "member" | "staff" | "president" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("1");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id || "1");
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const memberLinks = [
    { to: "/member/dashboard", icon: Home, label: "Accueil" },
    { to: "/member/events", icon: Calendar, label: "Événements" },
    { to: "/member/chat", icon: MessageSquare, label: "Chat" },
    { to: "/member/forum", icon: Users, label: "Forum" },
    { to: `/member/profile/${userId}`, icon: User, label: "Profil" },
    { to: `/member/settings/${userId}`, icon: Settings, label: "Paramètres" },
    { to: `/member/notifications/${userId}`, icon: Bell, label: "Notifications" },
  ];

  const staffLinks = [
    { to: "/staff/dashboard", icon: Home, label: "Tableau de bord" },
    { to: "/staff/events", icon: Calendar, label: "Événements" },
    { to: "/staff/event/new", icon: PlusCircle, label: "Créer événement" },
    { to: "/staff/channels", icon: Hash, label: "Canaux" },
    { to: "/staff/forum", icon: MessagesSquare, label: "Forum" },
    { to: `/staff/profile/${userId}`, icon: User, label: "Profil" },
    { to: `/staff/settings/${userId}`, icon: Settings, label: "Paramètres" },
    { to: `/staff/notifications/${userId}`, icon: Bell, label: "Notifications" },
  ];

  const presidentLinks = [
    { to: "/president/dashboard", icon: ShieldCheck, label: "Dashboard" },
    { to: "/president/events", icon: Calendar, label: "Événements" },
    { to: "/president/event/new", icon: PlusCircle, label: "Créer événement" },
    { to: "/president/members", icon: UserPlus, label: "Membres" },
    { to: "/president/channels", icon: Hash, label: "Canaux" },
    { to: "/president/forum", icon: MessagesSquare, label: "Forum" },
    { to: `/president/profile/${userId}`, icon: User, label: "Profil" },
    { to: `/president/settings/${userId}`, icon: Settings, label: "Paramètres" },
    { to: `/president/notifications/${userId}`, icon: Bell, label: "Notifications" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: Home, label: "Tableau de bord" },
    { to: "/admin/clubs", icon: Building2, label: "Clubs" },
    { to: "/admin/events", icon: Calendar, label: "Événements" },
    { to: "/admin/members", icon: Users, label: "Membres" },
    { to: "/admin/forums", icon: MessagesSquare, label: "Forums" },
    { to: "/admin/statistics", icon: BarChart3, label: "Statistiques" },
    { to: "/admin/communication", icon: MessageSquare, label: "Communication" },
    { to: `/admin/profile/${userId}`, icon: User, label: "Profil" },
    { to: `/admin/settings/${userId}`, icon: Settings, label: "Paramètres" },
    { to: `/admin/notifications/${userId}`, icon: Bell, label: "Notifications" },
  ];

  const links =
    role === "admin" ? adminLinks
      : role === "president" ? presidentLinks
      : role === "staff" ? staffLinks
      : memberLinks;

  const isActive = (to: string) => {
    if (to.includes("/profile/") || to.includes("/settings/") || to.includes("/notifications/")) {
      return location.pathname.startsWith(to.split("/").slice(0, -1).join("/"));
    }
    return location.pathname === to;
  };

  return (
    <aside
      className={cn(
        "bg-[#1B2A4A] text-white flex flex-col relative flex-shrink-0",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header: hamburger + logo (when expanded) */}
      <div className=" flex items-center min-h-[64px] overflow-hidden min-h-[64px] px-3 gap-3 pb-3 pt-2 ">
        <button
  onClick={() => setCollapsed(!collapsed)}
  className="w-8 h-8 rounded-md flex items-center ml-1 justify-center flex-shrink-0 text-gray-300 hover:text-white hover:bg-[#2D3E5F] transition-colors duration-200"
  title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
>
  <Menu className="w-5 h-5" />
</button>

        {/* Logo icon + name — fades in when expanded */}
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out",
            collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
          )}
        >
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0EA8A8] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight whitespace-nowrap">ClubConnect</h2>
              <p className="text-xs text-gray-400 whitespace-nowrap">Connectez. Créez.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <div key={link.to} className="relative group">
              <Link
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150",
                  active ? "bg-[#0EA8A8] text-white" : "text-gray-300 hover:bg-[#2D3E5F] hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {/* Label fades + slides */}
                <span
                  className={cn(
                    "text-sm whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
                    collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
                  )}
                >
                  {link.label}
                </span>
              </Link>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                  {link.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-[#2D3E5F]">
        <div className="relative group">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150",
              "text-red-400 hover:bg-red-500/10 hover:text-red-300"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span
              className={cn(
                "text-sm whitespace-nowrap font-medium transition-all duration-300 ease-in-out overflow-hidden",
                collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
              )}
            >
              Déconnexion
            </span>
          </button>

          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
              Déconnexion
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}