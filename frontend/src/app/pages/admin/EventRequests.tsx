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
  Eye,
  Clock,
  Users,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight
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
  endTime?: string;
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

interface EquipmentAvailability {
  name: string;
  available: boolean;
  quantity: number;
  availableQuantity: number;
}

interface RoomAvailability {
  name: string;
  available: boolean;
  capacity: number;
  timeSlot: string;
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
    endTime: "18:00",
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
    endTime: "18:00",
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
    endTime: "22:00",
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
    endTime: "17:00",
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
    endTime: "23:59",
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

// Fonction pour simuler la vérification de disponibilité
const checkAvailability = (event: Event): { equipment: EquipmentAvailability[], rooms: RoomAvailability[] } => {
  // Simuler la vérification de disponibilité des équipements
  const equipmentAvailability: EquipmentAvailability[] = event.equipment.map(equip => ({
    name: equip,
    available: Math.random() > 0.3,
    quantity: 1,
    availableQuantity: Math.random() > 0.3 ? 1 : 0
  }));

  const roomsAvailability: RoomAvailability[] = [
    {
      name: event.room || event.location,
      available: Math.random() > 0.2,
      capacity: 200,
      timeSlot: `${event.date} ${event.time} - ${event.endTime || event.time}`
    }
  ];

  return { equipment: equipmentAvailability, rooms: roomsAvailability };
};

// Composant Agenda Mensuel
const MonthlyAgenda = ({ events, onEventClick }: { events: Event[], onEventClick: (event: Event) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Ajouter les jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Ajouter les jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Ajouter les jours du mois suivant
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const days = getDaysInMonth(currentDate);

  const getEventColor = (event: Event) => {
    switch(event.clubName) {
      case "Club d'Informatique": return "border-l-4 border-l-blue-500 bg-blue-50";
      case "Club Sportif": return "border-l-4 border-l-green-500 bg-green-50";
      case "Club Artistique": return "border-l-4 border-l-purple-500 bg-purple-50";
      case "BDE": return "border-l-4 border-l-pink-500 bg-pink-50";
      default: return "border-l-4 border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* En-tête du calendrier */}
      <div className="bg-gradient-to-r from-[#0EA8A8] to-[#1B2A4A] text-white p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeMonth(-1)}
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeMonth(1)}
            className="text-white hover:bg-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Cases du calendrier */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isToday = day.date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === day.date.toDateString();

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`
                min-h-[120px] p-2 border-r border-b cursor-pointer transition-all
                ${!day.isCurrentMonth && 'bg-gray-50 text-gray-400'}
                ${isToday && 'bg-blue-50'}
                ${isSelected && 'ring-2 ring-[#0EA8A8] ring-inset'}
                hover:bg-gray-50
              `}
            >
              <div className={`text-sm font-medium mb-2 ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`
                      text-xs p-1 rounded cursor-pointer hover:shadow-md transition-shadow
                      ${getEventColor(event)}
                    `}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.time}</div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal pour afficher les événements d'une journée */}
      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Événements du {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucun événement prévu ce jour</p>
              ) : (
                getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedDate(null);
                      onEventClick(event);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${getEventColor(event)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1B2A4A]">{event.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.clubName}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.time} - {event.endTime || event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.room || event.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.expectedAttendees}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`
                        ${event.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                        ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${event.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {event.status === 'approved' ? 'Approuvé' : 
                         event.status === 'pending' ? 'En attente' : 'Refusé'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default function AdminEventRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterClub, setFilterClub] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedEventAvailability, setSelectedEventAvailability] = useState<{ equipment: EquipmentAvailability[], rooms: RoomAvailability[] } | null>(null);

  const uniqueClubs = [...new Set(events.map(e => e.clubName))];

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
  const approvedEvents = events.filter(e => e.status === 'approved');
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
    if (event.status === 'pending') {
      const availability = checkAvailability(event);
      setSelectedEventAvailability(availability);
    } else {
      setSelectedEventAvailability(null);
    }
    setIsViewModalOpen(true);
  };

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
          userId="1"
          userName="Admin User"
          userRole="Administrateur"
          userRoleType="admin"
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Gestion des événements</h1>
            <p className="text-gray-600">Gérer les demandes et consulter l'agenda mensuel</p>
          </div>

          <Tabs defaultValue="agenda" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="agenda">
                Agenda
              </TabsTrigger>
              <TabsTrigger value="pending">
                Demandes <Badge className="ml-2 bg-[#F5A623]">{pendingEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Refusés <Badge className="ml-2 bg-red-500">{rejectedEvents.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agenda" className="space-y-4">
              <MonthlyAgenda events={approvedEvents} onEventClick={handleViewDetails} />
              
              {/* Légende */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Légende</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 border-l-4 border-l-blue-500 rounded"></div>
                    <span className="text-sm">Club d'Informatique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-50 border-l-4 border-l-green-500 rounded"></div>
                    <span className="text-sm">Club Sportif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-50 border-l-4 border-l-purple-500 rounded"></div>
                    <span className="text-sm">Club Artistique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-50 border-l-4 border-l-pink-500 rounded"></div>
                    <span className="text-sm">BDE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 ring-2 ring-[#0EA8A8] rounded"></div>
                    <span className="text-sm">Jour sélectionné</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
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

              {pendingEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">Aucune demande en attente</p>
                </Card>
              ) : (
                pendingEvents.map((event) => {
                  const availability = checkAvailability(event);
                  const allEquipmentAvailable = availability.equipment.every(e => e.available);
                  const roomAvailable = availability.rooms[0].available;
                  
                  return (
                    <Card key={event.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <ClubLogo clubName={event.clubName} logo={event.clubLogo} size="w-16 h-16" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-[#1B2A4A]">{event.title}</h3>
                              <Badge variant="secondary">{event.clubName}</Badge>
                              <Badge className="bg-[#F5A623]">En attente</Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{event.description}</p>
                            
                            <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{event.date} de {event.time} à {event.endTime || event.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{event.room || event.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{event.expectedAttendees} participants</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">Disponibilité des équipements:</span>
                                {allEquipmentAvailable ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Tous disponibles
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Certains indisponibles
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2 ml-6">
                                {availability.equipment.map((item, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline"
                                    className={item.available ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}
                                  >
                                    {item.name} {!item.available && "(Indisponible)"}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">Disponibilité de la salle:</span>
                                {roomAvailable ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Disponible
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Indisponible
                                  </Badge>
                                )}
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
                            disabled={!allEquipmentAvailable || !roomAvailable}
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
                  );
                })
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

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
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
                  <p className="font-medium">{selectedEvent.date} de {selectedEvent.time} à {selectedEvent.endTime || selectedEvent.time}</p>
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

              {selectedEvent.status === 'pending' && selectedEventAvailability && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Vérification des disponibilités</h4>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Équipements:</p>
                    <div className="space-y-2">
                      {selectedEventAvailability.equipment.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>{item.name}</span>
                          {item.available ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Disponible
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <XCircle className="w-3 h-3 mr-1" />
                              Indisponible
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Salles:</p>
                    <div className="space-y-2">
                      {selectedEventAvailability.rooms.map((room, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <div>
                            <span>{room.name}</span>
                            <p className="text-xs text-gray-500">{room.timeSlot}</p>
                          </div>
                          {room.available ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Disponible
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <XCircle className="w-3 h-3 mr-1" />
                              Indisponible
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
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