import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, members, events, channels } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, Calendar, MessageSquare, UserCheck, AlertCircle } from "lucide-react";
import { Link } from "react-router";

export default function StaffDashboard() {
  const pendingMembers = members.filter(m => m.status === 'pending');
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex h-screen">
      <Sidebar role="staff" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={`${currentUser.firstName} ${currentUser.lastName}`}
          userAvatar={currentUser.avatar}
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Tableau de bord Staff</h1>
            <p className="text-gray-600">Gérez votre club {currentUser.clubName}</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0EA8A8]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#0EA8A8]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Membres totaux</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">45</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Demandes en attente</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{pendingMembers.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Événements à venir</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">3</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Canaux actifs</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{channels.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pending Members */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1B2A4A]">Demandes de membres</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/staff/members">Voir tout</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {pendingMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="font-semibold text-gray-700">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1B2A4A]">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <UserCheck className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingMembers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Aucune demande en attente</p>
                )}
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1B2A4A]">Événements à venir</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/staff/events">Voir tout</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.participantCount}/{event.maxCapacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-auto py-6 bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
                <Link to="/staff/event/new">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-8 h-8" />
                    <span>Créer un événement</span>
                  </div>
                </Link>
              </Button>
              <Button className="h-auto py-6 bg-[#1B2A4A] hover:bg-[#2D3E5F]" asChild>
                <Link to="/staff/members">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8" />
                    <span>Gérer les membres</span>
                  </div>
                </Link>
              </Button>
              <Button className="h-auto py-6 bg-[#F5A623] hover:bg-[#e09615]" asChild>
                <Link to="/staff/channels">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="w-8 h-8" />
                    <span>Nouveau canal</span>
                  </div>
                </Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
