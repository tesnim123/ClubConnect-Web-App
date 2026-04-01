// pages/member/Events.tsx
import { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { EventCard } from "../../components/EventCard";
import { currentUser, events } from "../../data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Search, Filter, Calendar, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export default function MemberEvents() {
  const [user, setUser] = useState(currentUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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

  const myClubEvents = events.filter(e => e.clubId === user.clubId);
  const interClubEvents = events.filter(e => e.type === 'inter-club');
  const myParticipations = events.filter(e => e.participantCount > 0 && e.clubId === user.clubId).slice(0, 3);

  const filterEvents = (eventsList: any[]) => {
    return eventsList.filter(event => {
      const matchesSearch = searchQuery === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || event.status === filterStatus;
      const matchesType = filterType === "all" || event.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const handleRSVP = (eventId: string) => {
    toast.success("Inscription confirmée ! Vous recevrez un email de confirmation.");
  };

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Événements</h1>
            <p className="text-gray-600">Découvrez et participez aux événements de votre club et de l'université</p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un événement..."
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
              </Button>
            </div>

            {showFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="open">Ouvert</SelectItem>
                        <SelectItem value="full">Complet</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="intra-club">Intra-club</SelectItem>
                        <SelectItem value="inter-club">Inter-club</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFilterStatus("all");
                      setFilterType("all");
                      setSearchQuery("");
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <Tabs defaultValue="club" className="space-y-4">
            <TabsList className="bg-white">
              <TabsTrigger value="club">Mon Club ({filterEvents(myClubEvents).length})</TabsTrigger>
              <TabsTrigger value="inter">Inter-clubs ({filterEvents(interClubEvents).length})</TabsTrigger>
              <TabsTrigger value="my">Mes participations ({myParticipations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="club" className="space-y-4">
              {filterEvents(myClubEvents).length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun événement trouvé dans votre club</p>
                  <p className="text-sm text-gray-400 mt-2">Revenez plus tard pour découvrir les prochains événements</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterEvents(myClubEvents).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRSVP={() => handleRSVP(event.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inter" className="space-y-4">
              {filterEvents(interClubEvents).length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun événement inter-club trouvé</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterEvents(interClubEvents).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRSVP={() => handleRSVP(event.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="space-y-4">
              {myParticipations.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Vous n'avez pas encore participé à des événements</p>
                  <Button variant="link" asChild className="mt-2 text-[#0EA8A8]">
                    <a href="/member/events">Découvrir les événements</a>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myParticipations.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}