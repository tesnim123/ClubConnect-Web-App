import { useEffect, useState } from "react";
import { Check, Plus, UserX, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, ApiClientError } from "../../lib/api";
import type { AuthUser, StaffTitle } from "../../types/auth";
import type { AdminClub } from "../../types/club";

const STAFF_TITLES: StaffTitle[] = [
  "VICE_PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "HR",
  "PROJECT_MANAGER",
  "SPONSO_MANAGER",
  "LOGISTIC_MANAGER",
  "STAFF",
];

export default function PresidentMembersPage() {
  const { token, user } = useAuth();
  const canManageStaff = user?.role === "PRESIDENT";
  const [pending, setPending] = useState<AuthUser[]>([]);
  const [club, setClub] = useState<AdminClub | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    staffTitle: "STAFF" as StaffTitle,
  });

  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState<StaffTitle>("STAFF");
  const [searchMember, setSearchMember] = useState("");
  const [searchStaff, setSearchStaff] = useState("");

  const clubId = typeof user?.club === "object" ? user.club?._id : user?.club;

  const load = async () => {
    if (!token || !clubId) {
      return;
    }

    const [pendingResponse, clubResponse] = await Promise.all([
      apiRequest<{ items: AuthUser[] }>("/president/pending-members", { token }),
      apiRequest<{ club: AdminClub }>(`/clubs/${clubId}`, { token }),
    ]);

    setPending(pendingResponse.items);
    setClub(clubResponse.club);
  };

  useEffect(() => {
    void load();
  }, [token, clubId]);

  const updateMemberStatus = async (memberId: string, action: "accept" | "reject") => {
    if (!token) {
      return;
    }

    await apiRequest(`/president/${action}-member/${memberId}`, {
      method: "PUT",
      token,
    });

    toast.success(action === "accept" ? "Membre accepté." : "Membre rejeté.");
    await load();
  };

  const createStaff = async () => {
    if (!token || !canManageStaff) {
      return;
    }

    try {
      await apiRequest("/president/staff", {
        method: "POST",
        token,
        body: JSON.stringify(staffForm),
      });

      toast.success("Staff ajouté et email envoyé.");
      setStaffForm({ name: "", email: "", staffTitle: "STAFF" });
      await load();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Ajout impossible";
      toast.error(message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!token) return;
    if (!window.confirm("Êtes-vous sûr de vouloir retirer ce membre du club ?")) {
      return;
    }

    try {
      await apiRequest(`/president/members/${memberId}`, {
        method: "DELETE",
        token,
      });
      toast.success("Membre retiré du club avec succès.");
      await load();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Retrait impossible";
      toast.error(message);
    }
  };

  const handleUpdateRole = async (memberId: string, role: string, staffTitle: StaffTitle | null) => {
    if (!token) return;
    try {
      await apiRequest(`/president/members/${memberId}/role`, {
        method: "PUT",
        token,
        body: JSON.stringify({ role, staffTitle }),
      });
      toast.success("Rôle mis à jour avec succès.");
      setPromotingId(null);
      await load();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Mise à jour impossible";
      toast.error(message);
    }
  };

  // Filters
  const filteredMembers = club?.members.filter((m) =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.email.toLowerCase().includes(searchMember.toLowerCase())
  ) || [];

  const filteredStaff = club?.staff.filter((m) =>
    m.name.toLowerCase().includes(searchStaff.toLowerCase()) ||
    m.email.toLowerCase().includes(searchStaff.toLowerCase())
  ) || [];

  return (
    <AppShell
      title="Gestion des membres"
      description="Validez les demandes d'adhésion, gérez les rôles et ajoutez les membres du bureau."
      sectionOverride="president"
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Applications and General Members */}
        <div className="space-y-6">
          <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-bold text-[#10233F]">Demandes en attente</h2>
            <div className="mt-5 space-y-4">
              {pending.map((member) => (
                <div key={member._id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-[#10233F]">{member.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{member.email}</p>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => void updateMemberStatus(member._id, "accept")} className="bg-emerald-600 hover:bg-emerald-700">
                      <Check className="mr-2 h-4 w-4" />
                      Accepter
                    </Button>
                    <Button onClick={() => void updateMemberStatus(member._id, "reject")} variant="destructive">
                      <UserX className="mr-2 h-4 w-4" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}

              {pending.length === 0 ? <p className="text-sm text-gray-500">Aucune demande en attente.</p> : null}
            </div>
          </Card>

          <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-[#10233F]">Membres du club ({club?.members.length || 0})</h2>
              <Input
                placeholder="Rechercher un membre..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="max-w-xs h-9 text-sm"
              />
            </div>
            <div className="mt-5 space-y-4">
              {filteredMembers.map((member) => (
                <div key={member._id} className="rounded-2xl border border-slate-100 p-4 flex flex-col justify-between sm:flex-row sm:items-center gap-4">
                  <div>
                    <p className="font-semibold text-[#10233F]">{member.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {promotingId === member._id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={promoTitle}
                          onChange={(e) => setPromoTitle(e.target.value as StaffTitle)}
                          className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                        >
                          {STAFF_TITLES.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => {
                            const role = (promoTitle === "VICE_PRESIDENT") ? "VICE_PRESIDENT" : "STAFF";
                            void handleUpdateRole(member._id, role, promoTitle);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 h-9 px-3"
                        >
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPromotingId(null)}
                          className="h-9 px-3 text-gray-500 hover:bg-gray-100"
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <>
                        {canManageStaff && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPromotingId(member._id);
                              setPromoTitle("STAFF");
                            }}
                            className="border-[#0EA8A8] text-[#0EA8A8] hover:bg-[#0EA8A8]/10"
                          >
                            Promouvoir
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleRemoveMember(member._id)}
                        >
                          Retirer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {filteredMembers.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun membre ne correspond à la recherche.</p>
              ) : null}
            </div>
          </Card>
        </div>

        {/* Right Column: Staff management */}
        <div className="space-y-6">
          {canManageStaff ? (
            <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-bold text-[#10233F]">Ajouter un staff</h2>
              <div className="mt-5 space-y-3">
                <Input
                  placeholder="Nom complet"
                  value={staffForm.name}
                  onChange={(event) => setStaffForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={staffForm.email}
                  onChange={(event) => setStaffForm((prev) => ({ ...prev, email: event.target.value }))}
                />
                <select
                  value={staffForm.staffTitle}
                  onChange={(event) => setStaffForm((prev) => ({ ...prev, staffTitle: event.target.value as StaffTitle }))}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3"
                >
                  {STAFF_TITLES.map((staffTitle) => (
                    <option key={staffTitle} value={staffTitle}>
                      {staffTitle}
                    </option>
                  ))}
                </select>
                <Button onClick={createStaff} className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </Card>
          ) : null}

          <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-[#10233F]">Équipe du club ({club?.staff.length || 0})</h2>
              <Input
                placeholder="Rechercher dans le staff..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="max-w-xs h-9 text-sm"
              />
            </div>
            <div className="mt-5 space-y-4">
              {filteredStaff.map((member) => (
                <div key={member._id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-col justify-between md:flex-row md:items-start gap-4">
                    <div>
                      <p className="font-semibold text-[#10233F]">{member.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{member.email}</p>
                      <span className="mt-2 inline-block rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold text-[#0EA8A8]">
                        {member.staffTitle || member.role}
                      </span>
                    </div>

                    {canManageStaff && member._id !== user?._id && member.staffTitle !== "PRESIDENT" && (
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        {promotingId === member._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={promoTitle}
                              onChange={(e) => setPromoTitle(e.target.value as StaffTitle)}
                              className="h-8 rounded border border-gray-300 bg-white px-2 text-xs"
                            >
                              {STAFF_TITLES.map((title) => (
                                <option key={title} value={title}>
                                  {title}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              onClick={() => {
                                const role = (promoTitle === "VICE_PRESIDENT") ? "VICE_PRESIDENT" : "STAFF";
                                void handleUpdateRole(member._id, role, promoTitle);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2.5"
                            >
                              OK
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPromotingId(null)}
                              className="h-8 px-2.5 text-gray-500 hover:bg-gray-100"
                            >
                              X
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPromotingId(member._id);
                                setPromoTitle(member.staffTitle || "STAFF");
                              }}
                              className="text-xs h-8"
                            >
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleUpdateRole(member._id, "MEMBER", null)}
                              className="text-xs h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                            >
                              Rétrograder
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void handleRemoveMember(member._id)}
                              className="text-xs h-8"
                            >
                              Retirer
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredStaff.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun staff ne correspond à la recherche.</p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
