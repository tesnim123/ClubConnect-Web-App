// components/TopNav.tsx
import { Bell, LogOut, User, Settings, ChevronDown, X, CheckCircle, AlertCircle, Calendar, MessageSquare, Users, FileText, Image, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { currentUser } from "../data/mockData";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'event' | 'message' | 'member' | 'forum' | 'file';
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
  userRoleType?: 'admin' | 'staff' | 'president' | 'member' | 'vicepresident';
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
    title: "Nouvel événement",
    message: "Le Hackathon 2024 a été approuvé",
    type: "event",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
    link: "/events"
  },
  {
    id: "2",
    title: "Nouveau membre",
    message: "Pierre Durand a rejoint le Club d'Informatique",
    type: "member",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    link: "/members"
  },
  {
    id: "3",
    title: "Fichier partagé",
    message: "Jean a partagé un fichier dans le canal général",
    type: "file",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    link: "/chat"
  }
];

export function TopNav({ 
  userId = currentUser.id,
  userName = `${currentUser.firstName} ${currentUser.lastName}`,
  userAvatar = currentUser.avatar,
  userRole = currentUser.roleLabel || "Membre",
  userRoleType = currentUser.role || "member",
  notificationCount: externalNotificationCount,
  onNotificationClick,
  onLogout,
  notifications: externalNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}: TopNavProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(
    externalNotifications || defaultNotifications
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      toast.success("Déconnexion réussie");
      navigate("/login");
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate(`/${userRoleType}/profile/${userId}`);
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate(`/${userRoleType}/settings/${userId}`);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    } else {
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }
    if (notification.link) {
      navigate(`/${userRoleType}${notification.link}`);
    }
    setIsNotificationOpen(false);
    if (onNotificationClick) onNotificationClick();
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Toutes les notifications ont été marquées comme lues");
    }
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteNotification) {
      onDeleteNotification(id);
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification supprimée");
    }
  };

  const getUnreadCount = () => {
    if (externalNotificationCount !== undefined) return externalNotificationCount;
    return notifications.filter(n => !n.isRead).length;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'event': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'member': return <Users className="w-4 h-4 text-[#0EA8A8]" />;
      case 'forum': return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'file': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour obtenir les initiales du nom
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const unreadCount = getUnreadCount();
  
  // Gérer l'avatar avec fallback
  const getAvatarUrl = () => {
    if (userAvatar && userAvatar !== 'null' && userAvatar !== 'undefined') {
      return userAvatar;
    }
    // Utiliser DiceBear comme fallback avec les initiales ou un seed basé sur le nom
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#F5A623]">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-[#1B2A4A]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#0EA8A8] hover:text-[#0c8e8e] transition-colors"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-[#1B2A4A]">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="flex-shrink-0 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate(`/${userRoleType}/notifications/${userId}`);
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

        {/* User Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 transition-colors rounded-lg px-2 py-1"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={getAvatarUrl()} 
                alt={userName}
                onError={(e) => {
                  // Fallback en cas d'erreur de chargement
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
                }}
              />
              
            </Avatar>
            
            <div className="text-sm text-left">
              <div className="font-semibold text-[#1B2A4A]">{userName}</div>
              <div className="text-xs text-gray-500">{userRole}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-[#1B2A4A]">{userName}</div>
                <div className="text-xs text-gray-500">{userRole}</div>
              </div>
              
              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span>Mon profil</span>
              </button>
              
              <button
                onClick={handleSettingsClick}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Paramètres</span>
              </button>
              
              <div className="border-t border-gray-100 my-1" />
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}