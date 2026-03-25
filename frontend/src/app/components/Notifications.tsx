// pages/Notifications.tsx
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MessageSquare, 
  Users,
  X,
  Check,
  Filter,
  Search,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  FileText,
  Star,
  Heart,
  UserPlus,
  Award,
  Megaphone
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'message' | 'member' | 'forum' | 'club';
  createdAt: string;
  isRead: boolean;
  link?: string;
  image?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

// Données d'exemple de notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouvel événement approuvé",
    message: "Le Hackathon 2024 a été approuvé par l'administration. Vous pouvez maintenant le publier.",
    type: "event",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
    link: "/admin/events",
    sender: { name: "Admin", avatar: "" },
    metadata: { eventName: "Hackathon 2024", eventDate: "2024-05-15" }
  },
  {
    id: "2",
    title: "Nouveau membre",
    message: "Pierre Durand a rejoint le Club d'Informatique. Bienvenue à lui !",
    type: "member",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    link: "/admin/members",
    sender: { name: "Pierre Durand", avatar: "" }
  },
  {
    id: "3",
    title: "Message reçu",
    message: "Nouveau message de Jean Dupont dans le canal Staff Global: 'Réunion demain à 14h'",
    type: "message",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    link: "/admin/communication",
    sender: { name: "Jean Dupont", avatar: "" }
  },
  {
    id: "4",
    title: "Demande d'événement approuvée",
    message: "La demande d'événement 'Concert de Printemps' a été approuvée par l'administration.",
    type: "success",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    link: "/admin/events",
    sender: { name: "Admin", avatar: "" }
  },
  {
    id: "5",
    title: "Nouveau sujet dans le forum",
    message: "Un nouveau sujet 'Hackathon 2024 - Préparation' a été créé dans le forum du Club d'Informatique.",
    type: "forum",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isRead: true,
    link: "/admin/forums",
    sender: { name: "Jean Dupont", avatar: "" }
  },
  {
    id: "6",
    title: "Rappel: Réunion des présidents",
    message: "La réunion mensuelle des présidents aura lieu demain à 10h en salle de conférence.",
    type: "warning",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    isRead: true,
    link: "/admin/communication",
    metadata: { meetingTime: "10:00", meetingRoom: "Salle de conférence" }
  },
  {
    id: "7",
    title: "Club du mois",
    message: "Félicitations au Club d'Informatique pour avoir été élu club du mois !",
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    isRead: true,
    link: "/admin/clubs",
    sender: { name: "Administration", avatar: "" }
  },
  {
    id: "8",
    title: "Nouvelle demande de club",
    message: "Un nouveau club 'Club de Robotique' a déposé une demande de création.",
    type: "club",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    isRead: false,
    link: "/admin/clubs",
    metadata: { clubName: "Club de Robotique", status: "pending" }
  }
];

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer le rôle de l'utilisateur (à adapter selon votre authentification)
  const userRole = "admin"; // ou "staff", "member"

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'member':
        return <UserPlus className="w-5 h-5 text-[#0EA8A8]" />;
      case 'forum':
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'club':
        return <Users className="w-5 h-5 text-orange-500" />;
      case 'award':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const badges: { [key: string]: { label: string; className: string } } = {
      event: { label: "Événement", className: "bg-blue-100 text-blue-800" },
      message: { label: "Message", className: "bg-purple-100 text-purple-800" },
      member: { label: "Membre", className: "bg-[#0EA8A8]/10 text-[#0EA8A8]" },
      forum: { label: "Forum", className: "bg-indigo-100 text-indigo-800" },
      club: { label: "Club", className: "bg-orange-100 text-orange-800" },
      success: { label: "Succès", className: "bg-green-100 text-green-800" },
      warning: { label: "Attention", className: "bg-yellow-100 text-yellow-800" },
      award: { label: "Récompense", className: "bg-yellow-100 text-yellow-800" }
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
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par type
    if (selectedType !== "all") {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Filtre par date
    if (dateRange.start) {
      filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(n => new Date(n.createdAt) <= new Date(dateRange.end));
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    toast.success("Notification marquée comme lue");
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    toast.success("Toutes les notifications ont été marquées comme lues");
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
    { value: "club", label: "Clubs", count: notifications.filter(n => n.type === "club").length }
  ];

  return (
    <div className="flex h-screen">
      <Sidebar role={userRole as any} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userName="Admin User" 
          userRole="Administrateur" 
          notificationCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Notifications</h1>
                  <p className="text-gray-600">Toutes vos notifications en un seul endroit</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={refreshNotifications}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={markAllAsRead}
                      className="gap-2 text-[#0EA8A8] border-[#0EA8A8]"
                    >
                      <Check className="w-4 h-4" />
                      Tout marquer comme lu
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={deleteAllRead}
                    className="gap-2 text-red-600 border-red-400 hover:bg-red-600"
                  >
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
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filtres
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                </div>

                {showFilters && (
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de début
                        </label>
                        <Input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin
                        </label>
                        <Input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setDateRange({ start: "", end: "" });
                          setSearchQuery("");
                          setSelectedType("all");
                        }}
                      >
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
                      selectedType === type.value
                        ? 'bg-[#0EA8A8] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
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
                  return (
                    <Card
                      key={notification.id}
                      className={`p-4 hover:shadow-md transition-all cursor-pointer ${
                        !notification.isRead ? 'border-l-4 border-l-[#0EA8A8] bg-[#0EA8A8]/5' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        if (notification.link) navigate(notification.link);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-[#1B2A4A]">
                                  {notification.title}
                                </h3>
                                <Badge className={badge.className}>
                                  {badge.label}
                                </Badge>
                                {!notification.isRead && (
                                  <Badge className="bg-[#0EA8A8] text-white">
                                    Nouveau
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
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
                              </div>
                              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  {Object.entries(notification.metadata).map(([key, value]) => (
                                    <span key={key} className="mr-3">
                                      <strong>{key}:</strong> {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-red-100"
                                  title="Marquer comme lu"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500"
                                title="Supprimer"
                              >
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