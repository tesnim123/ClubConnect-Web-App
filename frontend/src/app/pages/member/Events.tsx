import { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { EventCard } from "../../components/EventCard";
import { currentUser, events } from "../../data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Search, Filter } from "lucide-react";

export default function MemberEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const myClubEvents = events.filter(e => e.clubId === currentUser.clubId);
  const interClubEvents = events.filter(e => e.type === 'inter-club');
  const myParticipations = events.filter(e => e.participantCount > 0).slice(0, 2); // Mock

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Événements</h1>
            <p className="text-gray-600">Découvrez et participez aux événements</p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="full">Complet</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="club" className="space-y-4">
            <TabsList>
              <TabsTrigger value="club">Mon Club</TabsTrigger>
              <TabsTrigger value="inter">Inter-clubs</TabsTrigger>
              <TabsTrigger value="my">Mes participations</TabsTrigger>
            </TabsList>

            <TabsContent value="club" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClubEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRSVP={() => console.log('RSVP', event.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="inter" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interClubEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRSVP={() => console.log('RSVP', event.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myParticipations.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
