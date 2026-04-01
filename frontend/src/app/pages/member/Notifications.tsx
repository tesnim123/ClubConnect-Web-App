// pages/member/Notifications.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, notifications as mockNotifications, Notification as NotificationType } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { 
  Bell, CheckCircle, AlertCircle, Calendar, MessageSquare, Users,
  X, Check, Filter, Search, ChevronDown, Trash2, Eye, EyeOff,
  RefreshCw, Clock, FileText, UserPlus, Award, Building
} from "lucide-react";
import { toast } from "sonner";

export default function MemberNotifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  const [notifications, setNotifications] = useState<NotificationType[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      }
    };
    
    loadUser();
    
    const handleUserUpdated = () => {
      loadUser();
    };
    
    window.addEventListener('userUpdated', handleUserUpdated);
    return () => window.removeEventListener('userUpdated', handleUserUpdated);
  }, []);
alert(user.avatar);
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'membership': return <UserPlus className="w-5 h-5 text-[#0EA8A8]" />;
      case 'forum': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'file': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'approval': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      event: { label: "Événement", className: "bg-blue-100 text-blue-800" },
      message: { label: "Message", className: "bg-purple-100 text-purple-800" },
      membership: { label: "Membre", className: "bg-[#0EA8A8]/10 text-[#0EA8A8]" },
      forum: { label: "Forum", className: "bg-indigo-100 text-indigo-800" },
      file: { label: "Fichier", className: "bg-amber-100 text-amber-800" },
      approval: { label: "Approbation", className: "bg-green-100 text-green-800" }
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
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedType !== "all") {
      filtered = filtered.filter(n => n.type === selectedType);
    }
    if (dateRange.start) {
      filtered = filtered.filter(n => new Date(n.timestamp) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(n => new Date(n.timestamp) <= new Date(dateRange.end));
    }
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return filtered;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast.success("Notification marquée comme lue");
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification supprimée");
  };

  const deleteAllRead = () => {
    if (window.confirm("Supprimer toutes les notifications lues ?")) {
      setNotifications(prev => prev.filter(n => !n.read));
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
  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationTypes = [
    { value: "all", label: "Tous", count: filteredNotifications.length },
    { value: "event", label: "Événements", count: notifications.filter(n => n.type === "event").length },
    { value: "message", label: "Messages", count: notifications.filter(n => n.type === "message").length },
    { value: "membership", label: "Membres", count: notifications.filter(n => n.type === "membership").length },
    { value: "forum", label: "Forum", count: notifications.filter(n => n.type === "forum").length }
  ];

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          userAvatar={user.avatar}
          userRole={user.roleLabel || "Membre"}
          userRoleType={user.role}
          notificationCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate("/member/dashboard")}
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
     <Button
                    onClick={deleteAllRead}
                    variant="outline"
                    className="gap-2 text-red-600 border-red-500 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer les lues
                  </Button>
                </div>
              </div>

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
                        !notification.read ? 'border-l-4 border-l-[#0EA8A8] bg-[#0EA8A8]/5' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) markAsRead(notification.id);
                        if (notification.link) navigate(`/member${notification.link}`);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-[#1B2A4A]">{notification.title}</h3>
                                <Badge className={badge.className}>{badge.label}</Badge>
                                {!notification.read && <Badge className="bg-[#0EA8A8] text-white">Nouveau</Badge>}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(notification.timestamp)}</span>
                                </div>
                                {notification.sender && (
                                  <div className="flex items-center gap-1">
                                    <UserPlus className="w-3 h-3" />
                                    <span>De: {notification.sender.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }} className="text-gray-400">
                                  <Eye className="w-4 h-4" />
                                </Button>
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