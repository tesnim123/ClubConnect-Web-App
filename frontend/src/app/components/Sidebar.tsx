// components/Sidebar.tsx
import { Link, useLocation } from "react-router";
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
  FileText,
  PlusCircle,
  ListChecks,
  UserPlus,
  Hash
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useState, useEffect } from "react";

interface SidebarProps {
  role: "member" | "staff" | "president" | "admin";
  collapsed?: boolean;
}

export function Sidebar({ role, collapsed = false }: SidebarProps) {
  const location = useLocation();
  const [userId, setUserId] = useState("1");
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id || "1");
      } catch (e) {}
    }
  }, []);

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

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                active ? "bg-[#0EA8A8] text-white" : "hover:bg-[#2D3E5F]"
              )}
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
    </aside>
  );
}