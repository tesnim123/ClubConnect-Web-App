// components/TopNav.tsx
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  ChevronDown,
  FileText,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getRoleSlug } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "event" | "message" | "member" | "forum" | "file";
  createdAt: string;
  isRead: boolean;
  link?: string;
  image?: string;
  sender?: { name: string; avatar?: string };
}

interface TopNavProps {
  userId?: string;
  userName: string;
  userAvatar?: string | null;
  userRole?: string;
  userRoleType?: "admin" | "staff" | "president" | "member" | "vicepresident";
  notificationCount?: number;
  onNotificationClick?: () => void;
  onLogout?: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouvel evenement",
    message: "Le Hackathon 2024 a ete approuve",
    type: "event",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
    link: "/events",
  },
  {
    id: "2",
    title: "Nouveau membre",
    message: "Pierre Durand a rejoint le Club d'Informatique",
    type: "member",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    link: "/members",
  },
  {
    id: "3",
    title: "Fichier partage",
    message: "Jean a partage un fichier dans le canal general",
    type: "file",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    link: "/chat",
  },
];

export function TopNav({
  userId = "me",
  userName = "Utilisateur",
  userAvatar = null,
  userRole = "Membre",
  notificationCount: externalNotificationCount,
  onNotificationClick,
  onLogout,
  notifications: externalNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
}: TopNavProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(
    externalNotifications || defaultNotifications
  );

  const resolvedUserId = user?._id ?? userId;
  const resolvedUserName = user?.name ?? userName;
  const resolvedUserRole = user?.role ?? userRole;
  const roleSlug = getRoleSlug(resolvedUserRole);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);

    if (onLogout) {
      onLogout();
      return;
    }

    logout();
    toast.success("Deconnexion reussie");
    navigate("/login");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate(`/${roleSlug}/profile/${resolvedUserId}`);
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate(`/${roleSlug}/settings/${resolvedUserId}`);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    } else {
      setNotifications((prev) =>
        prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
      );
    }

    if (notification.link) {
      navigate(`/${roleSlug}${notification.link}`);
    }

    setIsNotificationOpen(false);

    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
      return;
    }

    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    toast.success("Toutes les notifications ont ete marquees comme lues");
  };

  const handleDeleteNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (onDeleteNotification) {
      onDeleteNotification(id);
      return;
    }

    setNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.success("Notification supprimee");
  };

  const getUnreadCount = () => {
    if (externalNotificationCount !== undefined) {
      return externalNotificationCount;
    }

    return notifications.filter((item) => !item.isRead).length;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "member":
        return <Users className="h-4 w-4 text-[#0EA8A8]" />;
      case "forum":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case "file":
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "A l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const unreadCount = getUnreadCount();

  const getAvatarUrl = () => {
    if (userAvatar && userAvatar !== "null" && userAvatar !== "undefined") {
      return userAvatar;
    }

    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(resolvedUserName)}`;
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="sm"
            className="relative mt-2 h-9 w-9 p-0"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
          >
            <Bell className="h-8 w-8" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-[#F5A623] p-0 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>

          {isNotificationOpen && (
            <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#0EA8A8] transition-colors hover:text-[#0c8e8e]"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="mb-2 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`cursor-pointer border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-[#1B2A4A]">{notification.title}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-gray-600">{notification.message}</p>
                            </div>
                            <button
                              onClick={(event) => handleDeleteNotification(notification.id, event)}
                              className="flex-shrink-0 text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-2">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate(`/${roleSlug}/notifications/${resolvedUserId}`);
                    }}
                    className="w-full text-center text-xs text-[#0EA8A8] hover:text-[#0c8e8e]"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={getAvatarUrl()}
                alt={resolvedUserName}
                onError={(event) => {
                  event.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    resolvedUserName
                  )}`;
                }}
              />
              <AvatarFallback className="text-xs">{getInitials(resolvedUserName)}</AvatarFallback>
            </Avatar>

            <div className="text-left text-sm">
              <div className="text-sm font-semibold text-[#1B2A4A]">{resolvedUserName}</div>
              <div className="text-xs text-gray-500">{resolvedUserRole}</div>
            </div>
            <ChevronDown
              className={`h-3 w-3 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2">
                <div className="text-sm font-semibold text-[#1B2A4A]">{resolvedUserName}</div>
                <div className="text-xs text-gray-500">{resolvedUserRole}</div>
              </div>

              <button
                onClick={handleProfileClick}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                <User className="h-4 w-4 text-gray-500" />
                <span>Mon profil</span>
              </button>

              <button
                onClick={handleSettingsClick}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 text-gray-500" />
                <span>Parametres</span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Deconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
