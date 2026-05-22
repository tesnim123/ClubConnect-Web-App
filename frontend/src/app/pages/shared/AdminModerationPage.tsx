import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, CalendarDays, MapPin, Clock, Wrench, Users, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, ApiClientError } from "../../lib/api";
import type { ClubPost, ClubEvent } from "../../types/club";

export default function AdminModerationPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "reservations">("posts");
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [reservations, setReservations] = useState<ClubEvent[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadPosts = async () => {
    if (!token) return;
    try {
      const response = await apiRequest<{ items: ClubPost[] }>("/admin/posts/pending", { token });
      setPosts(response.items);
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

  useEffect(() => {
    if (token) {
      void loadPosts();
      void loadReservations();
    }
  }, [token]);

  const moderatePost = async (postId: string, action: "publish" | "reject") => {
    if (!token) return;
    try {
      await apiRequest(`/admin/posts/${postId}/${action}`, {
        method: "PATCH",
        token,
      });

      toast.success(action === "publish" ? "Post publié." : "Post rejeté.");
      await loadPosts();
    } catch (err) {
      toast.error("Erreur lors de la modération du post.");
    }
  };

  const moderateReservation = async (eventId: string, action: "APPROVED" | "REJECTED", reason?: string) => {
    if (!token) return;
    try {
      await apiRequest(`/events/${eventId}/validate`, {
        method: "PUT",
        token,
        body: JSON.stringify({ action, rejectionReason: reason }),
      });

      toast.success(action === "APPROVED" ? "Réservation approuvée et salle bloquée." : "Réservation refusée.");
      setRejectingId(null);
      setRejectionReason("");
      await loadReservations();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Erreur de validation";
      toast.error(message);
    }
  };

  const pendingReservations = reservations.filter((r) => r.status === "PENDING");
  const processedReservations = reservations.filter((r) => r.status !== "PENDING");

  return (
    <AppShell
      title="Modération & Validation"
      description="Validez les publications du forum et les réservations de salles des clubs."
      sectionOverride="admin"
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "posts"
              ? "border-[#0EA8A8] text-[#0EA8A8]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Publications Forum ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("reservations")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "reservations"
              ? "border-[#0EA8A8] text-[#0EA8A8]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Réservations de Salles ({pendingReservations.length})
        </button>
      </div>

      {activeTab === "posts" && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0EA8A8]">{post.type}</p>
                  <h2 className="mt-1 text-xl font-bold text-[#10233F]">{post.title}</h2>
                  <p className="mt-2 text-sm text-gray-500">{post.author.name} · {post.club.name}</p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">{post.content}</p>
                </div>

                <div className="flex min-w-[220px] flex-col gap-3">
                  <Button onClick={() => void moderatePost(post._id, "publish")} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Publier
                  </Button>
                  <Button onClick={() => void moderatePost(post._id, "reject")} variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeter
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {posts.length === 0 ? (
            <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              Aucun post en attente de modération.
            </Card>
          ) : null}
        </div>
      )}

      {activeTab === "reservations" && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-[#10233F] mb-4">Demandes de réservation en attente</h3>
            <div className="space-y-4">
              {pendingReservations.map((res) => (
                <Card key={res._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded font-semibold border border-amber-100">
                        En attente de validation
                      </span>
                      <h4 className="text-xl font-bold text-[#10233F] mt-1">{res.title}</h4>
                      <p className="text-sm font-semibold text-[#0EA8A8]">{res.club.name}</p>
                      {res.description && (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{res.description}</p>
                      )}

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>Salle : <strong>{res.room}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Date/Heure : <strong>{new Date(res.date).toLocaleDateString("fr-FR")} de {res.startTime} à {res.endTime}</strong></span>
                        </div>
                        {res.clubs && res.clubs.length > 1 && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>Partenaires : {res.clubs.map((c) => (typeof c === "object" ? c.name : c)).join(", ")}</span>
                          </div>
                        )}
                        {res.equipments && res.equipments.length > 0 && (
                          <div className="flex items-start gap-2 sm:col-span-2">
                            <Wrench className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {res.equipments.map((eq) => (
                                <span key={eq} className="bg-slate-50 text-slate-600 text-[10px] px-1.5 py-0.5 rounded border border-slate-100">{eq}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <Button onClick={() => void moderateReservation(res._id, "APPROVED")} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                      <Button onClick={() => setRejectingId(res._id)} variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Refuser
                      </Button>
                    </div>
                  </div>

                  {rejectingId === res._id && (
                    <div className="mt-4 p-4 border-t border-slate-100 space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Motif du refus :</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Indiquez la raison du refus (ex: Conflit avec un autre événement, matériel manquant...)"
                        rows={2}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => { setRejectingId(null); setRejectionReason(""); }}>
                          Annuler
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => void moderateReservation(res._id, "REJECTED", rejectionReason)}>
                          Confirmer le refus
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {pendingReservations.length === 0 ? (
                <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                  Aucune demande de réservation de salle en attente.
                </Card>
              ) : null}
            </div>
          </div>

          {processedReservations.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-[#10233F] mb-4">Historique des modérations</h3>
              <div className="space-y-4">
                {processedReservations.map((res) => (
                  <Card key={res._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] opacity-85">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          res.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {res.status === "APPROVED" ? "Approuvé" : "Refusé"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(res.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-[#10233F]">{res.title}</h4>
                        <p className="text-sm font-semibold text-[#0EA8A8]">{res.club.name}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>Salle : {res.room}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Date/Heure : {new Date(res.date).toLocaleDateString("fr-FR")} de {res.startTime} à {res.endTime}</span>
                        </div>
                      </div>

                      {res.status === "REJECTED" && res.rejectionReason && (
                        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-rose-800 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                          <span><strong>Motif de refus :</strong> {res.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
