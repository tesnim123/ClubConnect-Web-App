// pages/admin/ClubDetails.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { ArrowLeft, Edit, Users, Calendar, Mail, User, Trash2, X, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { clubs } from "../../data/mockData";
import { useState } from "react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed";
}

export default function ClubDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClub, setEditedClub] = useState<any>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: "1", name: "Jean Dupont", email: "jean.dupont@example.com", role: "Président" },
    { id: "2", name: "Marie Martin", email: "marie.martin@example.com", role: "Vice-président" },
    { id: "3", name: "Pierre Durand", email: "pierre.durand@example.com", role: "Secrétaire" },
  ]);
  const [events, setEvents] = useState<ClubEvent[]>([
    { id: "1", title: "Réunion hebdomadaire", date: "2024-03-25", location: "Salle A101", status: "upcoming" },
    { id: "2", title: "Atelier de formation", date: "2024-03-28", location: "Salle B202", status: "upcoming" },
    { id: "3", title: "Événement caritatif", date: "2024-03-20", location: "Campus Central", status: "completed" },
  ]);
  
  // Staff management state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffFormData, setStaffFormData] = useState({ name: "", email: "", role: "" });
  
  // Event management state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [eventFormData, setEventFormData] = useState({ title: "", date: "", location: "", status: "upcoming" as ClubEvent["status"] });

  // Find the club by id
  const club = clubs.find(c => c.id === id);

  // Initialize edited club when editing starts
  const startEditing = () => {
    if (club) {
      setEditedClub({ ...club });
      setIsEditing(true);
    }
  };

  const handleUpdateClub = async () => {
    try {
      // In a real app, you'd make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the club in the local array (in a real app, this would be done by the API)
      const clubIndex = clubs.findIndex(c => c.id === id);
      if (clubIndex !== -1) {
        clubs[clubIndex] = { ...editedClub };
      }
      
      toast.success("Club modifié avec succès");
      setIsEditing(false);
      // Force a re-render by navigating to the same route
      navigate(`/admin/clubs/${id}`, { replace: true });
      window.location.reload(); // In a real app, you'd use state management instead
    } catch (error) {
      toast.error("Erreur lors de la modification du club");
    }
  };

  const handleDeleteClub = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce club ? Cette action est irréversible.")) {
      setIsDeleting(true);
      try {
        // In a real app, you'd make an API call here
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove club from the array (in a real app, this would be done by the API)
        const clubIndex = clubs.findIndex(c => c.id === id);
        if (clubIndex !== -1) {
          clubs.splice(clubIndex, 1);
        }
        
        toast.success("Club supprimé avec succès");
        navigate("/admin/clubs");
      } catch (error) {
        toast.error("Erreur lors de la suppression du club");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Staff Management Functions
  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffFormData({ name: "", email: "", role: "Membre" });
    setIsStaffModalOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffFormData({ name: member.name, email: member.email, role: member.role });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!staffFormData.name || !staffFormData.email || !staffFormData.role) {
      toast.error("Tous les champs sont requis");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingStaff) {
        // Update existing staff
        setStaffMembers(staffMembers.map(m => 
          m.id === editingStaff.id 
            ? { ...m, ...staffFormData }
            : m
        ));
        toast.success("Membre modifié avec succès");
      } else {
        // Add new staff
        const newStaff: StaffMember = {
          id: Date.now().toString(),
          ...staffFormData,
        };
        setStaffMembers([...staffMembers, newStaff]);
        toast.success("Membre ajouté avec succès");
      }
      
      setIsStaffModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteStaff = async (memberId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setStaffMembers(staffMembers.filter(m => m.id !== memberId));
        toast.success("Membre supprimé avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  // Event Management Functions
  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventFormData({ title: "", date: "", location: "", status: "upcoming" });
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: ClubEvent) => {
    setEditingEvent(event);
    setEventFormData({ 
      title: event.title, 
      date: event.date, 
      location: event.location, 
      status: event.status 
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventFormData.title || !eventFormData.date || !eventFormData.location) {
      toast.error("Tous les champs sont requis");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingEvent) {
        // Update existing event
        setEvents(events.map(e => 
          e.id === editingEvent.id 
            ? { ...e, ...eventFormData }
            : e
        ));
        toast.success("Événement modifié avec succès");
      } else {
        // Add new event
        const newEvent: ClubEvent = {
          id: Date.now().toString(),
          ...eventFormData,
        };
        setEvents([newEvent, ...events]);
        toast.success("Événement ajouté avec succès");
      }
      
      setIsEventModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setEvents(events.filter(e => e.id !== eventId));
        toast.success("Événement supprimé avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const getStatusBadge = (status: ClubEvent["status"]) => {
    const statusConfig = {
      upcoming: { color: "bg-blue-100 text-blue-800", label: "À venir" },
      ongoing: { color: "bg-green-100 text-green-800", label: "En cours" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Terminé" },
    };
    const config = statusConfig[status];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  if (!club) {
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
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Club non trouvé</h2>
              <p className="text-gray-500 mb-4">Le club que vous recherchez n'existe pas.</p>
              <Button onClick={() => navigate("/admin/clubs")} className="bg-[#0EA8A8]">
                Retour à la liste
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          {/* Header with back button and actions */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/clubs")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la gestion des clubs</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">{club.name}</h1>
                <p className="text-gray-600">Gestion détaillée du club</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={startEditing}
                  className="border-[#0EA8A8] text-[#0EA8A8] hover:bg-[#0EA8A8] hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteClub}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Club Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Club Banner and Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {club.coverPhoto ? (
                  <img 
                    src={club.coverPhoto} 
                    alt={club.name} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-[#0EA8A8] to-[#1B2A4A] flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{club.name.charAt(0)}</span>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{club.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{staffMembers.length} membres du staff</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Créé le {new Date("2024-01-15").toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Événements récents</h2>
                  
                </div>
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun événement pour le moment</p>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex-1 cursor-pointer" onClick={() => handleEditEvent(event)}>
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(event.status)}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button 
                  variant="link" 
                  className="mt-4 text-[#0EA8A8] p-0"
                  onClick={() => navigate(`/admin/events?club=${id}`)}
                >
                  Voir tous les événements →
                </Button>
              </div>
            </div>

            {/* Right Column - Staff Members */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1B2A4A]">Staff du club</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddStaff}
                    className="text-[#0EA8A8] border-[#0EA8A8]"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-3">
                  {staffMembers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun membre du staff</p>
                  ) : (
                    staffMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 bg-[#0EA8A8] rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => handleEditStaff(member)}>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.role}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteStaff(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Actions rapides</h2>
                <div className="space-y-2">
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/admin/communication?club=${id}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer une communication
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/admin/members/`)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gérer les membres
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Club Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le club</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du club
              </label>
              <Input
                value={editedClub?.name || ""}
                onChange={(e) => setEditedClub({ ...editedClub, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editedClub?.description || ""}
                onChange={(e) => setEditedClub({ ...editedClub, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateClub} className="bg-[#0EA8A8]">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Modal */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Modifier le membre" : "Ajouter un membre"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <Input
                value={staffFormData.name}
                onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                placeholder="jean@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={staffFormData.role}
                onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
              >
                <option value="Président">Président</option>
                <option value="Vice-président">Vice-président</option>
                <option value="Secrétaire">Secrétaire</option>
                <option value="Trésorier">Trésorier</option>
                <option value="Membre">Membre</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveStaff} className="bg-[#0EA8A8]">
              {editingStaff ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Modifier l'événement" : "Ajouter un événement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <Input
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                placeholder="Titre de l'événement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={eventFormData.date}
                onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu
              </label>
              <Input
                value={eventFormData.location}
                onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                placeholder="Salle, campus, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={eventFormData.status}
                onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value as ClubEvent["status"] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
              >
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEvent} className="bg-[#0EA8A8]">
              {editingEvent ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}