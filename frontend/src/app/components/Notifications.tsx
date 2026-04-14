// components/Notifications.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { 
  Bell, CheckCircle, AlertCircle, Calendar, MessageSquare, Users,
  X, Check, Filter, Search, ChevronDown, Trash2, Eye, EyeOff,
  RefreshCw, Clock, FileText, UserPlus, Award, Mail, Phone, Building
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'message' | 'member' | 'forum' | 'club' | 'file';
  createdAt: string;
  isRead: boolean;
  link?: string;
  sender?: { name: string; avatar?: string };
  metadata?: Record<string, any>;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'president' | 'member';
  roleLabel: string;
  clubName?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouvel événement approuvé",
    message: "Le Hackathon 2024 a été approuvé par l'administration.",
    type: "event",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
    link: "/events",
    sender: { name: "Admin" }
  },
  {
    id: "2",
    title: "Nouveau membre",
    message: "Pierre Durand a rejoint le Club d'Informatique.",
    type: "member",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    link: "/members",
    sender: { name: "Pierre Durand" }
  },
  {
    id: "3",
    title: "Message reçu",
    message: "Nouveau message de Jean Dupont dans le canal Staff Global.",
    type: "message",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    link: "/communication",
    sender: { name: "Jean Dupont" }
  },
  {
    id: "4",
    title: "Fichier partagé",
    message: "Marie a partagé un document dans le forum.",
    type: "file",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isRead: true,
    link: "/forum",
    sender: { name: "Marie" }
  },
  {
    id: "5",
    title: "Rappel: Réunion des présidents",
    message: "La réunion mensuelle aura lieu demain à 10h.",
    type: "warning",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    link: "/events"
  }
];

export default function Notifications() {
  const { id, role } = useParams<{ id: string; role?: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo>({
    id: "1",
    firstName: "Marie",
    lastName: "Dubois",
    role: "member",
    roleLabel: "Membre",
    clubName: "Club Robotique"
  });
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role === "admin") setUser({ ...user, role: "admin", roleLabel: "Administrateur" });
    else if (role === "president") setUser({ ...user, role: "president", roleLabel: "Président" });
    else if (role === "staff") setUser({ ...user, role: "staff", roleLabel: "Staff" });
    else setUser({ ...user, role: "member", roleLabel: "Membre" });
  }, [role]);

  const getBasePath = () => {
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'president') return '/president/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/member/dashboard';
  };

  const resolveNotificationPath = (notification: Notification) => {
    if (!notification.link) return null;

    const roleBase = `/${user.role}`;
    const mapByLink: Record<string, string> = {
      "/events": `${roleBase}/events`,
      "/forum": `${roleBase}/forum`,
      "/members": user.role === "admin" ? "/admin/members" : user.role === "president" ? "/president/members" : `${roleBase}/dashboard`,
      "/communication": user.role === "admin" ? "/admin/communication" : `${roleBase}/channels`,
      "/chat": `${roleBase}/channels`,
    };

    return mapByLink[notification.link] ?? `${roleBase}${notification.link}`;
  };

  const getSidebarRole = () => user.role;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'event': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'member': return <UserPlus className="w-5 h-5 text-[#0EA8A8]" />;
      case 'forum': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'club': return <Building className="w-5 h-5 text-orange-500" />;
      case 'file': return <FileText className="w-5 h-5 text-orange-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      event: { label: "Événement", className: "bg-blue-100 text-blue-800" },
      message: { label: "Message", className: "bg-purple-100 text-purple-800" },
      member: { label: "Membre", className: "bg-[#0EA8A8]/10 text-[#0EA8A8]" },
      forum: { label: "Forum", className: "bg-indigo-100 text-indigo-800" },
      club: { label: "Club", className: "bg-orange-100 text-orange-800" },
      file: { label: "Fichier", className: "bg-amber-100 text-amber-800" },
      success: { label: "Succès", className: "bg-green-100 text-green-800" },
      warning: { label: "Attention", className: "bg-yellow-100 text-yellow-800" }
    };
    return badges[type] || { label: "Info", className: "bg-gray-100 text-gray-800" };
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

  const filterNotifications = () => {
    let filtered = [...notifications];
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedType !== "all") {
      filtered = filtered.filter(n => n.type === selectedType);
    }
    if (dateRange.start) {
      filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(n => new Date(n.createdAt) <= new Date(dateRange.end));
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filtered;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    toast.success("Notification marquée comme lue");
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification supprimée");
  };

  const deleteAllRead = () => {
    if (window.confirm("Supprimer toutes les notifications lues ?")) {
      setNotifications(prev => prev.filter(n => !n.isRead));
      toast.success("Notifications lues supprimées");
    }
  };

  const refreshNotifications = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Notifications actualisées");
    }, 1000);
  };

  const filteredNotifications = filterNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const notificationTypes = [
    { value: "all", label: "Tous", count: filteredNotifications.length },
    { value: "event", label: "Événements", count: notifications.filter(n => n.type === "event").length },
    { value: "message", label: "Messages", count: notifications.filter(n => n.type === "message").length },
    { value: "member", label: "Membres", count: notifications.filter(n => n.type === "member").length },
    { value: "forum", label: "Forum", count: notifications.filter(n => n.type === "forum").length },
    { value: "file", label: "Fichiers", count: notifications.filter(n => n.type === "file").length }
  ];

  return (
    <div className="flex h-screen">
      <Sidebar role={getSidebarRole()} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          userRole={user.roleLabel}
          userRoleType={user.role}
          notificationCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate(getBasePath())}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors mb-6"
            >
              ← Retour
            </button>

            <div className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Notifications</h1>
                  <p className="text-gray-600">Toutes vos notifications en un seul endroit</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={refreshNotifications} disabled={isLoading} className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                  {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead} className="gap-2 text-[#0EA8A8] border-[#0EA8A8]">
                      <Check className="w-4 h-4" />
                      Tout marquer comme lu
                    </Button>
                  )}
                  <Button variant="outline" onClick={deleteAllRead} className="gap-2 text-red-600 border-red-400">
                    <Trash2 className="w-4 h-4" />
                    Supprimer les lues
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une notification..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                </div>

                {showFilters && (
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                        <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                        <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button variant="ghost" size="sm" onClick={() => { setDateRange({ start: "", end: "" }); setSearchQuery(""); setSelectedType("all"); }}>
                        Réinitialiser
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Type Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {notificationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedType === type.value ? 'bg-[#0EA8A8] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.label}
                    {type.count > 0 && (
                      <Badge className={`ml-2 ${selectedType === type.value ? 'bg-white text-[#0EA8A8]' : 'bg-gray-200 text-gray-600'}`}>
                        {type.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune notification</h3>
                <p className="text-gray-500">Vous n'avez pas encore de notifications</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const badge = getNotificationBadge(notification.type);
                  const targetPath = resolveNotificationPath(notification);
                  return (
                    <Card
                      key={notification.id}
                      className={`overflow-hidden border-0 p-0 shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)] ${
                        !notification.isRead ? 'bg-[#f4fbfb]' : 'bg-white'
                      }`}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        if (targetPath) navigate(targetPath);
                      }}
                    >
                      <div className={`h-1 w-full ${!notification.isRead ? "bg-[#0EA8A8]" : "bg-slate-100"}`} />
                      <div className="flex items-start gap-4 p-5">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#eef6ff]">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-[#1B2A4A]">{notification.title}</h3>
                                <Badge className={badge.className}>{badge.label}</Badge>
                                {!notification.isRead && <Badge className="bg-[#0EA8A8] text-white">Nouveau</Badge>}
                              </div>
                              <p className="mb-3 text-sm leading-6 text-gray-600">{notification.message}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(notification.createdAt)}</span>
                                </div>
                                {notification.sender && (
                                  <div className="flex items-center gap-1">
                                    <UserPlus className="w-3 h-3" />
                                    <span>De: {notification.sender.name}</span>
                                  </div>
                                )}
                                {targetPath && (
                                  <span className="rounded-full bg-[#F3F6FA] px-2 py-1 text-[11px] font-medium text-slate-500">
                                    Ouvrir la page
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                  className="rounded-full text-[#0EA8A8] hover:bg-[#0EA8A8]/10 hover:text-[#0EA8A8]"
                                  title="Marquer comme vue"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              {notification.isRead && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600" title="Notification vue">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="text-gray-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
