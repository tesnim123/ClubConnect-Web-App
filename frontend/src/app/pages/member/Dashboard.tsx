import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { EventCard } from "../../components/EventCard";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { currentUser, events } from "../../data/mockData";
import { Calendar, MessageSquare, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function MemberDashboard() {
  const upcomingEvents = events.filter(e => e.clubId === currentUser.clubId).slice(0, 3);
  const interClubEvents = events.filter(e => e.type === 'inter-club').slice(0, 2);

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={`${currentUser.firstName} ${currentUser.lastName}`}
          userAvatar={currentUser.avatar}
          notificationCount={3}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2D3E5F] rounded-xl p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {currentUser.firstName}! 👋
            </h1>
            <p className="text-lg opacity-90">
              Membre de <span className="font-semibold">{currentUser.clubName}</span>
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
                  <p className="text-sm text-gray-600">Événements</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">8</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Messages non lus</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">12</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Posts forum</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">23</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participation</p>
                  <p className="text-2xl font-bold text-[#1B2A4A]">92%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#1B2A4A]">Événements à venir</h2>
              <Button variant="outline" asChild>
                <Link to="/member/events">Voir tout</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRSVP={() => console.log('RSVP', event.id)}
                />
              ))}
            </div>
          </div>

          {/* Inter-club Events */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#1B2A4A]">Événements inter-clubs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interClubEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRSVP={() => console.log('RSVP', event.id)}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Activité récente</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-[#0EA8A8]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#0EA8A8]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1B2A4A]">Nouvel événement créé</p>
                    <p className="text-sm text-gray-600">Compétition de Robots - 15 avril 2026</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Il y a 2 heures</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1B2A4A]">Nouveau post forum</p>
                    <p className="text-sm text-gray-600">Thomas a posté dans "Ressources Arduino"</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Il y a 5 heures</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1B2A4A]">Nouveaux membres</p>
                    <p className="text-sm text-gray-600">3 nouveaux membres ont rejoint le club</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Hier</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
