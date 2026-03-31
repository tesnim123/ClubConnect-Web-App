// pages/admin/EventRequests.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  Search, 
  Filter,
  ChevronDown,
  Eye
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";

interface Event {
  id: string;
  title: string;
  description: string;
  clubName: string;
  clubLogo: string;
  date: string;
  time: string;
  location: string;
  room?: string;
  equipment: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  expectedAttendees?: number;
  budget?: number;
  clubId?: string;
  requesterName?: string;
  requesterEmail?: string;
  rejectionReason?: string;
}

// Fonction pour générer une couleur de fond basée sur le nom du club
const getClubColor = (clubName: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500"
  ];
  const index = clubName.length % colors.length;
  return colors[index];
};

// Données d'exemple avec des logos en base64 ou couleurs
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Hackathon 2024",
    description: "Compétition de programmation de 24h pour développer des solutions innovantes.",
    clubName: "Club d'Informatique",
    clubLogo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%230EA8A8'/%3E%3Ctext x='32' y='40' text-anchor='middle' fill='white' font-size='24' font-weight='bold'%3ECI%3C/text%3E%3C/svg%3E",
    date: "2024-04-15",
    time: "09:00",
    location: "Salle de conférence",
    room: "Amphi A",
    equipment: ["Projecteur", "Tableaux blancs", "Connexion Wi-Fi"],
    status: 'pending',
    createdAt: "2024-03-10",
    expectedAttendees: 150,
    budget: 2500,
    requesterName: "Jean Dupont",
    requesterEmail: "jean.dupont@example.com"
  },
  {
    id: "2",
    title: "Tournoi de Basketball",
    description: "Tournoi annuel de basketball opposant les différents clubs de l'université.",
    clubName: "Club Sportif",
    clubLogo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%231B2A4A'/%3E%3Ctext x='32' y='40' text-anchor='middle' fill='white' font-size='24' font-weight='bold'%3ECS%3C/text%3E%3C/svg%3E",
    date: "2024-04-20",
    time: "14:00",
    location: "Gymnase universitaire",
    room: "Terrain central",
    equipment: ["Ballons", "Chronomètre", "Tableau d'affichage"],
    status: 'pending',
    createdAt: "2024-03-12",
    expectedAttendees: 200,
    budget: 1500,
    requesterName: "Marie Martin",
    requesterEmail: "marie.martin@example.com"
  },
  {
    id: "3",
    title: "Concert de Printemps",
    description: "Concert annuel du club musical avec des performances d'étudiants.",
    clubName: "Club Artistique",
    clubLogo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23F5A623'/%3E%3Ctext x='32' y='40' text-anchor='middle' fill='white' font-size='24' font-weight='bold'%3ECA%3C/text%3E%3C/svg%3E",
    date: "2024-05-05",
    time: "19:00",
    location: "Auditorium",
    room: "Grande salle",
    equipment: ["Scène", "Éclairage", "Système son"],
    status: 'approved',
    createdAt: "2024-03-01",
    expectedAttendees: 300,
    budget: 3000,
    requesterName: "Pierre Durand",
    requesterEmail: "pierre.durand@example.com"
  },
  {
    id: "4",
    title: "Conférence sur l'IA",
    description: "Conférence sur les dernières avancées en intelligence artificielle.",
    clubName: "Club d'Informatique",
    clubLogo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%230EA8A8'/%3E%3Ctext x='32' y='40' text-anchor='middle' fill='white' font-size='24' font-weight='bold'%3ECI%3C/text%3E%3C/svg%3E",
    date: "2024-03-28",
    time: "15:00",
    location: "Salle de conférence",
    room: "Amphi B",
    equipment: ["Projecteur", "Ordinateur", "Microphone"],
    status: 'approved',
    createdAt: "2024-02-25",
    expectedAttendees: 80,
    budget: 800,
    requesterName: "Sophie Bernard",
    requesterEmail: "sophie.bernard@example.com"
  },
  {
    id: "5",
    title: "Gala de Fin d'Année",
    description: "Soirée de gala annuelle récompensant les meilleurs étudiants.",
    clubName: "BDE",
    clubLogo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%239C27B0'/%3E%3Ctext x='32' y='40' text-anchor='middle' fill='white' font-size='24' font-weight='bold'%3EBDE%3C/text%3E%3C/svg%3E",
    date: "2024-06-10",
    time: "20:00",
    location: "Palais des Congrès",
    room: "Grande salle",
    equipment: ["Scène", "Éclairage", "Système son"],
    status: 'rejected',
    createdAt: "2024-02-20",
    expectedAttendees: 500,
    budget: 10000,
    requesterName: "Emma Richard",
    requesterEmail: "emma.richard@example.com",
    rejectionReason: "Budget trop élevé"
  }
];

export default function AdminEventRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterClub, setFilterClub] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);

  // Get all unique clubs
  const uniqueClubs = [...new Set(events.map(e => e.clubName))];

  // Filter events
  const filterEvents = (eventsList: Event[]) => {
    return eventsList.filter(event => {
      const matchesSearch = searchQuery === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.clubName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClub = filterClub === "all" || event.clubName === filterClub;
      
      return matchesSearch && matchesClub;
    });
  };

  const pendingEvents = filterEvents(events.filter(e => e.status === 'pending'));
  const approvedEvents = filterEvents(events.filter(e => e.status === 'approved'));
  const rejectedEvents = filterEvents(events.filter(e => e.status === 'rejected'));

  const handleApprove = async (event: Event) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, status: 'approved' as const } : e
      ));
      toast.success(`Événement "${event.title}" approuvé avec succès`);
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (event: Event) => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez fournir une raison pour le refus");
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, status: 'rejected' as const, rejectionReason } : e
      ));
      toast.success(`Événement "${event.title}" refusé`);
      setIsRejectModalOpen(false);
      setRejectionReason("");
    } catch (error) {
      toast.error("Erreur lors du refus");
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  // Composant pour afficher le logo du club
  const ClubLogo = ({ clubName, logo, size = "w-16 h-16" }: { clubName: string; logo: string; size?: string }) => {
    const [imgError, setImgError] = useState(false);
    
    if (imgError || !logo) {
      const initial = clubName.charAt(0);
      const colorClass = getClubColor(clubName);
      return (
        <div className={`${size} ${colorClass} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
          {initial}
        </div>
      );
    }
    
    return (
      <img
        src={logo}
        alt={clubName}
        className={`${size} rounded-lg object-cover`}
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
  userId="admin_1"
  userName="Admin User"
  userRole="Administrateur"
  userRoleType="admin"
  notificationCount={5}
/>

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Demandes d'événements</h1>
            <p className="text-gray-600">Approuver ou refuser les demandes d'événements</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par titre ou club..."
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
                      Club
                    </label>
                    <select
                      value={filterClub}
                      onChange={(e) => setFilterClub(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                    >
                      <option value="all">Tous les clubs</option>
                      {uniqueClubs.map(club => (
                        <option key={club} value={club}>{club}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFilterClub("all");
                      setSearchQuery("");
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                En attente <Badge className="ml-2 bg-[#F5A623]">{pendingEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approuvés <Badge className="ml-2 bg-green-500">{approvedEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Refusés <Badge className="ml-2 bg-red-500">{rejectedEvents.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">Aucune demande en attente</p>
                </Card>
              ) : (
                pendingEvents.map((event) => (
                  <Card key={event.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <ClubLogo clubName={event.clubName} logo={event.clubLogo} size="w-16 h-16" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-[#1B2A4A]">{event.title}</h3>
                            <Badge variant="secondary">{event.clubName}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date} à {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{event.room || event.location}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-1">Équipement demandé:</p>
                            <div className="flex flex-wrap gap-2">
                              {event.equipment.map((item, idx) => (
                                <Badge key={idx} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(event)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                        <Button 
                          className="bg-green-500 hover:bg-green-600"
                          size="sm"
                          onClick={() => handleApprove(event)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsRejectModalOpen(true);
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">Aucun événement approuvé</p>
                </Card>
              ) : (
                approvedEvents.map((event) => (
                  <Card key={event.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <ClubLogo clubName={event.clubName} logo={event.clubLogo} size="w-16 h-16" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-[#1B2A4A]">{event.title}</h3>
                            <Badge variant="secondary">{event.clubName}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date} à {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{event.room || event.location}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-1">Équipement demandé:</p>
                            <div className="flex flex-wrap gap-2">
                              {event.equipment.map((item, idx) => (
                                <Badge key={idx} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(event)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">Aucun événement refusé</p>
                </Card>
              ) : (
                rejectedEvents.map((event) => (
                  <Card key={event.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <ClubLogo clubName={event.clubName} logo={event.clubLogo} size="w-16 h-16" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-[#1B2A4A]">{event.title}</h3>
                            <Badge variant="secondary">{event.clubName}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date} à {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{event.room || event.location}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-1">Équipement demandé:</p>
                            <div className="flex flex-wrap gap-2">
                              {event.equipment.map((item, idx) => (
                                <Badge key={idx} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </div>
                          {event.rejectionReason && (
                            <div className="mt-3 p-2 bg-red-50 rounded-md">
                              <p className="text-xs text-red-600">
                                <span className="font-medium">Raison:</span> {event.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(event)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* View Details Modal - Design original */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l'événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ClubLogo clubName={selectedEvent.clubName} logo={selectedEvent.clubLogo} size="w-12 h-12" />
                <div>
                  <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600">{selectedEvent.clubName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Date et heure</p>
                  <p className="font-medium">{selectedEvent.date} à {selectedEvent.time}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lieu</p>
                  <p className="font-medium">{selectedEvent.room || selectedEvent.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Participants attendus</p>
                  <p className="font-medium">{selectedEvent.expectedAttendees || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p className="font-medium">{selectedEvent.budget ? `${selectedEvent.budget}€` : "Non spécifié"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Description</p>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Équipement requis</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.equipment.map((item, idx) => (
                    <Badge key={idx} variant="outline">{item}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Demandeur</p>
                <p className="text-sm">{selectedEvent.requesterName || "Non spécifié"}</p>
                {selectedEvent.requesterEmail && (
                  <p className="text-sm text-gray-500">{selectedEvent.requesterEmail}</p>
                )}
              </div>

              {selectedEvent.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-md">
                  <p className="text-red-600 text-sm font-medium mb-1">Raison du refus:</p>
                  <p className="text-red-600 text-sm">{selectedEvent.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le refus.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Expliquez pourquoi cette demande est refusée..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedEvent && handleReject(selectedEvent)}
            >
              Confirmer le refus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}