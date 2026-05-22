import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock, Wrench, Users, Trash2, AlertCircle, CheckCircle2, XCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { apiRequest, ApiClientError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { getRoleSection } from "../../lib/role";
import type { ClubPost, ClubEvent, AdminClub } from "../../types/club";

const PREDEFINED_ROOMS = [
  "Amphithéâtre A",
  "Amphithéâtre B",
  "Salle de réunion 101",
  "Salle de réunion 102",
  "Grand Hall",
  "Foyer des étudiants",
  "Gymnase",
];

const PREDEFINED_EQUIPMENTS = [
  "Vidéoprojecteur",
  "Microphone & Sonorisation",
  "Tableau Blanc",
  "Chaises supplémentaires",
  "Buffet & Traiteur",
];

export default function PublicEventsPage() {
  const { user, token } = useAuth();
  const section = getRoleSection(user?.role);

  const [activeTab, setActiveTab] = useState<"posts" | "reservations">("posts");
  const [publicPosts, setPublicPosts] = useState<ClubPost[]>([]);
  const [reservations, setReservations] = useState<ClubEvent[]>([]);
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    room: PREDEFINED_ROOMS[0],
    equipments: [] as string[],
    partnerClubs: [] as string[],
  });

  const userClubId = typeof user?.club === "object" ? user?.club?._id : user?.club;
  const canReserve = user && ["PRESIDENT", "VICE_PRESIDENT", "STAFF"].includes(user.role);

  const loadPublicPosts = async () => {
    try {
      const response = await apiRequest<{ items: ClubPost[] }>("/posts/public/events");
      setPublicPosts(response.items);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReservations = async () => {
    if (!token) return;
    try {
      const response = await apiRequest<{ items: ClubEvent[] }>("/events", { token });
      setReservations(response.items);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClubs = async () => {
    if (!token) return;
    try {
      const response = await apiRequest<{ items: AdminClub[] }>("/clubs", { token });
      setClubs(response.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadPublicPosts();
    if (token) {
      void loadReservations();
      void loadClubs();
    }
  }, [token]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.room) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error("L'heure de fin doit être après l'heure de début.");
      return;
    }

    try {
      await apiRequest("/events", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room,
          equipments: formData.equipments,
          clubs: formData.partnerClubs,
        }),
      });

      toast.success("Demande de réservation soumise à l'Admin.");
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        room: PREDEFINED_ROOMS[0],
        equipments: [],
        partnerClubs: [],
      });
      await loadReservations();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Impossible de soumettre la demande";
      toast.error(message);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return;

    try {
      await apiRequest(`/events/${id}`, {
        method: "DELETE",
        token,
      });
      toast.success("Réservation supprimée.");
      await loadReservations();
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleEquipmentChange = (equipment: string) => {
    setFormData((prev) => {
      const updated = prev.equipments.includes(equipment)
        ? prev.equipments.filter((e) => e !== equipment)
        : [...prev.equipments, equipment];
      return { ...prev, equipments: updated };
    });
  };

  const handlePartnerClubChange = (clubId: string) => {
    setFormData((prev) => {
      const updated = prev.partnerClubs.includes(clubId)
        ? prev.partnerClubs.filter((id) => id !== clubId)
        : [...prev.partnerClubs, clubId];
      return { ...prev, partnerClubs: updated };
    });
  };

  return (
    <AppShell
      title="Événements & Réservations"
      description="Consultez les événements publics et gérez les réservations de salles de votre club."
      sectionOverride={section}
    >
      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "posts"
              ? "border-[#0EA8A8] text-[#0EA8A8]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Fil des Événements Publics
        </button>
        {token && (
          <button
            onClick={() => setActiveTab("reservations")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "reservations"
                ? "border-[#0EA8A8] text-[#0EA8A8]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Planning & Réservations de Salles
          </button>
        )}
      </div>

      {activeTab === "posts" && (
        <div className="grid gap-4 xl:grid-cols-2">
          {publicPosts.map((event) => (
            <Card key={event._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3 text-[#0EA8A8]">
                <CalendarDays className="h-5 w-5" />
                <span className="text-sm font-semibold">{event.club.name}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-[#10233F]">{event.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{new Date(event.publishedAt || event.createdAt).toLocaleString("fr-FR")}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">{event.content}</p>
            </Card>
          ))}

          {publicPosts.length === 0 ? (
            <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              Aucun événement public pour le moment.
            </Card>
          ) : null}
        </div>
      )}

      {activeTab === "reservations" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-[#10233F]">Planning des Salles</h2>
            {canReserve && (
              <Button onClick={() => setIsModalOpen(true)} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                <Plus className="mr-2 h-4 w-4" />
                Réserver une salle
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {reservations.map((res) => {
              const isCreator = typeof res.createdBy === "object" ? res.createdBy?._id === user?._id : res.createdBy === user?._id;
              const isClubOfficer = ["PRESIDENT", "VICE_PRESIDENT"].includes(user?.role || "") && String(res.club?._id || res.club) === String(userClubId);
              const isAdmin = user?.role === "ADMIN";
              const canDelete = isCreator || isClubOfficer || isAdmin;

              return (
                <Card key={res._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        res.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : res.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {res.status === "APPROVED" ? "Approuvé" : res.status === "REJECTED" ? "Refusé" : "En attente"}
                      </span>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDeleteReservation(res._id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-[#10233F]">{res.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 font-semibold">{res.club.name}</p>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{res.room}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(res.date).toLocaleDateString("fr-FR")} de {res.startTime} à {res.endTime}
                        </span>
                      </div>
                      {res.clubs && res.clubs.length > 1 && (
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="font-semibold text-xs text-gray-500 block">Clubs partenaires :</span>
                            <span className="text-xs">
                              {res.clubs.map((c) => (typeof c === "object" ? c.name : c)).join(", ")}
                            </span>
                          </div>
                        </div>
                      )}
                      {res.equipments && res.equipments.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Wrench className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="font-semibold text-xs text-gray-500 block">Matériels :</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {res.equipments.map((eq) => (
                                <span key={eq} className="bg-slate-50 text-slate-600 text-[10px] px-1.5 py-0.5 rounded border border-slate-100">
                                  {eq}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {res.status === "REJECTED" && res.rejectionReason && (
                    <div className="mt-4 p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      <span><strong>Motif de refus :</strong> {res.rejectionReason}</span>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Créé par {typeof res.createdBy === "object" ? res.createdBy.name : "un membre"}</span>
                  </div>
                </Card>
              );
            })}

            {reservations.length === 0 ? (
              <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)] col-span-2">
                Aucune réservation enregistrée pour le moment.
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-bold text-[#10233F] mb-2">Réserver une salle & matériels</h3>
            <p className="text-sm text-gray-500 mb-6">Soumettez votre demande. Elle sera vérifiée et validée par l'Administrateur.</p>

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titre de l'événement *</label>
                <Input
                  required
                  placeholder="Ex: Conférence sur l'IA, Soirée d'intégration..."
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] focus:border-[#0EA8A8]"
                  rows={3}
                  placeholder="Détaillez le déroulement de l'événement..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <Input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Début *</label>
                  <Input
                    required
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fin *</label>
                  <Input
                    required
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Salle *</label>
                <select
                  value={formData.room}
                  onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                >
                  {PREDEFINED_ROOMS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Matériels nécessaires</label>
                <div className="grid grid-cols-2 gap-2">
                  {PREDEFINED_EQUIPMENTS.map((eq) => (
                    <label key={eq} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.equipments.includes(eq)}
                        onChange={() => handleEquipmentChange(eq)}
                        className="rounded text-[#0EA8A8] focus:ring-[#0EA8A8]"
                      />
                      <span>{eq}</span>
                    </label>
                  ))}
                </div>
              </div>

              {clubs.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Clubs partenaires (Inter-clubs)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-slate-50">
                    {clubs
                      .filter((c) => String(c._id) !== String(userClubId))
                      .map((c) => (
                        <label key={c._id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.partnerClubs.includes(c._id)}
                            onChange={() => handlePartnerClubChange(c._id)}
                            className="rounded text-[#0EA8A8] focus:ring-[#0EA8A8]"
                          />
                          <span className="truncate">{c.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                >
                  Envoyer la demande
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
