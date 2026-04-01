// pages/member/Dashboard.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { EventCard } from "../../components/EventCard";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { currentUser, events, notifications, forumPosts } from "../../data/mockData";
import { Calendar, MessageSquare, Users, TrendingUp, Bell, BookOpen, Award, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";

export default function MemberDashboard() {
  const [user, setUser] = useState(currentUser);
  
  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        console.log("Dashboard: Données utilisateur chargées", parsed);
      } catch (e) {
        console.error("Erreur lors du chargement des données utilisateur", e);
      }
    } else {
      localStorage.setItem("user", JSON.stringify(currentUser));
      setUser(currentUser);
    }
  };
  
  useEffect(() => {
    // Chargement initial
    loadUser();
    
    // Écouter les changements dans localStorage (quand un autre onglet/modifie les données)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        console.log("Dashboard: Changement détecté dans localStorage");
        loadUser();
      }
    };
    
    // Écouter l'événement personnalisé pour les mises à jour dans la même fenêtre
    const handleUserUpdated = () => {
      console.log("Dashboard: Événement userUpdated détecté");
      loadUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  const myClubEvents = events.filter(e => e.clubId === user.clubId && e.status === 'open').slice(0, 3);
  const interClubEvents = events.filter(e => e.type === 'inter-club' && e.status === 'open').slice(0, 2);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const recentForumPosts = forumPosts.filter(p => p.clubId === user.clubId).slice(0, 3);
console.log(user.avatar)
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
          notificationCount={3}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0EA8A8] rounded-xl p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {user.firstName}! 👋
            </h1>
            <p className="text-lg opacity-90">
              Membre de <span className="font-semibold">{user.clubName}</span> depuis {new Date(user.joinDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0EA8A8]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#0EA8A8]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Événements participés</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">{user.stats?.eventsAttended || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Notifications non lues</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">{unreadNotifications}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Posts forum</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">{user.stats?.forumPosts || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Messages envoyés</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">{user.stats?.messagesSent || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Events */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Events */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-[#1B2A4A]">Événements à venir</h2>
                  <Button variant="outline" asChild>
                    <Link to="/member/events">Voir tout</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myClubEvents.map((event) => (
                    <EventCard key={event.id} event={event} onRSVP={() => console.log('RSVP', event.id)} />
                  ))}
                  {myClubEvents.length === 0 && (
                    <Card className="p-8 text-center col-span-2">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun événement à venir dans votre club</p>
                      <Button variant="link" asChild className="mt-2 text-[#0EA8A8]">
                        <Link to="/member/events">Voir tous les événements</Link>
                      </Button>
                    </Card>
                  )}
                </div>
              </div>

              {/* Inter-club Events */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-[#1B2A4A]">Événements inter-clubs</h2>
                  <Button variant="outline" asChild>
                    <Link to="/member/events">Voir tout</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interClubEvents.map((event) => (
                    <EventCard key={event.id} event={event} onRSVP={() => console.log('RSVP', event.id)} />
                  ))}
                  {interClubEvents.length === 0 && (
                    <Card className="p-8 text-center col-span-2">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun événement inter-club à venir</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Activity */}
            <div className="space-y-6">
              {/* Recent Forum Posts */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Forum récent</h2>
                  <Button variant="link" asChild className="text-[#0EA8A8] p-0">
                    <Link to="/member/forum">Voir tout</Link>
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentForumPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => window.location.href = "/member/forum"}
                    >
                      <p className="font-semibold text-[#1B2A4A] text-sm line-clamp-1">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">par {post.authorName}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                  {recentForumPosts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Aucun post récent</p>
                  )}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#0EA8A8]" />
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Activité récente</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Vous avez participé à l'atelier Arduino</p>
                      <p className="text-xs text-gray-400">Il y a 2 jours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nouveau message dans le canal général</p>
                      <p className="text-xs text-gray-400">Il y a 5 jours</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Achievements */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-[#F5A623]" />
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Récompenses</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0EA8A8]/10 rounded-full">
                    <Calendar className="w-4 h-4 text-[#0EA8A8]" />
                    <span className="text-sm">Participant actif</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-full">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Contributeur forum</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-full">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Membre depuis 2024</span>
                  </div>
                </div>
              </Card>

              {/* Quick Links */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Accès rapide</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild className="justify-start">
                    <Link to="/member/chat"><MessageSquare className="w-4 h-4 mr-2" />Chat</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link to="/member/forum"><Users className="w-4 h-4 mr-2" />Forum</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link to="/member/events"><Calendar className="w-4 h-4 mr-2" />Événements</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link to={`/member/profile/${user.id}`}><Users className="w-4 h-4 mr-2" />Mon profil</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}