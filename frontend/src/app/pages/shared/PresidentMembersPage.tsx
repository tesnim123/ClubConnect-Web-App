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

    toast.success(action === "accept" ? "Membre accepte." : "Membre rejete.");
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

      toast.success("Staff ajoute et email envoye.");
      setStaffForm({ name: "", email: "", staffTitle: "STAFF" });
      await load();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Ajout impossible";
      toast.error(message);
    }
  };

  return (
    <AppShell
      title="Gestion des membres"
      description="Validez les demandes d'adhesion et ajoutez les membres du bureau."
      sectionOverride="president"
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
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
            <h2 className="text-xl font-bold text-[#10233F]">Equipe du club</h2>
            <div className="mt-5 space-y-3">
              {club?.staff.map((member) => (
                <div key={member._id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-[#10233F]">{member.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{member.email}</p>
                  <p className="mt-2 text-xs font-semibold text-[#0EA8A8]">{member.staffTitle || member.role}</p>
                </div>
              ))}

              {club?.staff.length === 0 ? <p className="text-sm text-gray-500">Aucun staff configure.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
