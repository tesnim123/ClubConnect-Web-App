import { ArrowLeft, Edit, Mail, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, ApiClientError } from "../../lib/api";
import type { AdminClub } from "../../types/club";

const STAFF_TITLES_LABEL: Record<string, string> = {
  PRESIDENT: "Président",
  VICE_PRESIDENT: "Vice-président",
  SECRETARY: "Secrétaire",
  TREASURER: "Trésorier",
  HR: "RH",
  PROJECT_MANAGER: "Project Manager",
  SPONSO_MANAGER: "Sponso Manager",
  LOGISTIC_MANAGER: "Logistic Manager",
};

export default function ClubDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token, user } = useAuth();
  const [club, setClub] = useState<AdminClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClub, setEditedClub] = useState({ name: "", description: "" });

  useEffect(() => {
    const loadClub = async () => {
      if (!id) {
        return;
      }

      try {
        const response = await apiRequest<{ club: AdminClub }>(`/admin/clubs/${id}`, {
          method: "GET",
          token,
        });
        setClub(response.club);
        setEditedClub({
          name: response.club.name,
          description: response.club.description,
        });
      } catch {
        setClub(null);
      } finally {
        setLoading(false);
      }
    };

    void loadClub();
  }, [id, token]);

  const handleUpdateClub = async () => {
    if (!id) {
      return;
    }

    try {
      const response = await apiRequest<{ club: AdminClub }>(`/admin/clubs/${id}`, {
        method: "PUT",
        token,
        body: JSON.stringify(editedClub),
      });
      setClub(response.club);
      setIsEditing(false);
      toast.success("Club modifié avec succès");
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Modification impossible";
      toast.error(message);
    }
  };

  const handleDeleteClub = async () => {
    if (!id || !window.confirm("Supprimer ce club ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiRequest(`/admin/clubs/${id}`, {
        method: "DELETE",
        token,
      });
      toast.success("Club supprimé avec succès");
      navigate("/admin/clubs");
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Suppression impossible";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar role="admin" />
        <div className="flex flex-1 items-center justify-center">Chargement...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex h-screen">
        <Sidebar role="admin" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav
            userId={user?._id}
            userName={user?.name ?? "Admin User"}
            userRole="Administrateur"
            userRoleType="admin"
            notificationCount={5}
          />
          <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
            <div className="py-12 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-700">Club non trouvé</h2>
              <p className="mb-4 text-gray-500">Le club recherché n'existe pas.</p>
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

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          userId={user?._id}
          userName={user?.name ?? "Admin User"}
          userRole="Administrateur"
          userRoleType="admin"
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/clubs")}
              className="mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-[#0EA8A8]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la gestion des clubs</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-[#1B2A4A]">{club.name}</h1>
                <p className="text-gray-600">Détails du club et responsables enregistrés</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-[#0EA8A8] text-[#0EA8A8] hover:bg-[#0EA8A8] hover:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button variant="destructive" onClick={handleDeleteClub} disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex h-48 items-center justify-center bg-[linear-gradient(135deg,#10233F_0%,#0EA8A8_100%)]">
                  <span className="text-6xl font-bold text-white">{club.name.charAt(0)}</span>
                </div>
                <div className="p-6">
                  <h2 className="mb-3 text-xl font-bold text-[#1B2A4A]">Description</h2>
                  <p className="leading-relaxed text-gray-700">{club.description || "Aucune description renseignée."}</p>

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{club.staff.length} responsables staff</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{club.members.length} membres</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-[#1B2A4A]">Staff du club</h2>
                <div className="space-y-3">
                  {club.staff.length === 0 ? (
                    <p className="py-4 text-center text-gray-500">Aucun responsable staff</p>
                  ) : (
                    club.staff.map((member) => (
                      <div key={member._id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0EA8A8] font-bold text-white">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">
                            {member.staffTitle ? STAFF_TITLES_LABEL[member.staffTitle] : member.role}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le club</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nom du club</label>
              <Input
                value={editedClub.name}
                onChange={(event) => setEditedClub((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editedClub.description}
                onChange={(event) =>
                  setEditedClub((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
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
    </div>
  );
}