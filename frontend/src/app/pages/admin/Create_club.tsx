import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, ApiClientError } from "../../lib/api";
import type { StaffTitle } from "../../types/club";

type StaffMemberForm = {
  id: string;
  email: string;
  name: string;
  staffTitle: StaffTitle;
};

const STAFF_OPTIONS: Array<{ value: StaffTitle; label: string }> = [
  { value: "PRESIDENT", label: "President" },
  { value: "VICE_PRESIDENT", label: "Vice President" },
  { value: "SECRETARY", label: "Secretaire" },
  { value: "TREASURER", label: "Tresorier" },
  { value: "HR", label: "RH" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "SPONSO_MANAGER", label: "Sponso Manager" },
  { value: "LOGISTIC_MANAGER", label: "Logistic Manager" },
];

export default function CreateClub() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [staffMembers, setStaffMembers] = useState<StaffMemberForm[]>([
    { id: "1", email: "", name: "", staffTitle: "PRESIDENT" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addStaffMember = () => {
    const usedTitles = new Set(staffMembers.map((member) => member.staffTitle));
    const nextTitle = STAFF_OPTIONS.find((option) => !usedTitles.has(option.value))?.value;

    if (!nextTitle) {
      toast.error("Tous les postes principaux sont deja ajoutes");
      return;
    }

    setStaffMembers((prev) => [
      ...prev,
      { id: Date.now().toString(), email: "", name: "", staffTitle: nextTitle },
    ]);
  };

  const removeStaffMember = (id: string) => {
    if (staffMembers.length === 1) {
      return;
    }

    setStaffMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const updateStaffMember = (id: string, field: keyof StaffMemberForm, value: string) => {
    setStaffMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, [field]: value } : member))
    );
  };

  const validateForm = () => {
    if (!clubName.trim()) {
      return "Le nom du club est requis";
    }

    if (!description.trim()) {
      return "La description est requise";
    }

    const invalidStaff = staffMembers.some(
      (member) => !member.email.trim() || !member.name.trim() || !member.staffTitle
    );
    if (invalidStaff) {
      return "Tous les champs du staff sont requis";
    }

    const presidentCount = staffMembers.filter((member) => member.staffTitle === "PRESIDENT").length;
    if (presidentCount !== 1) {
      return "Un seul President est obligatoire";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    setError(validationError);

    if (validationError) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest<{
        message: string;
        generatedPasswords?: Array<{ email: string; staffTitle: StaffTitle; password: string }>;
      }>("/admin/clubs", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: clubName,
          description,
          staffMembers: staffMembers.map((member) => ({
            name: member.name,
            email: member.email,
            staffTitle: member.staffTitle,
          })),
        }),
      });

      toast.success("Club cree avec succes", {
        description: response.generatedPasswords?.length
          ? "Les comptes staff ont ete crees et les emails ont ete declenches."
          : response.message,
      });
      navigate("/admin/clubs");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Une erreur est survenue";
      setError(message);
      toast.error("Creation impossible", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

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
              <span>Retour a la gestion des clubs</span>
            </button>

            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#1B2A4A]">Creer un nouveau club</h1>
              <p className="text-gray-600">
                Le club sera enregistre dans la base et chaque responsable recevra son acces par email.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nom du club <span className="text-red-500">*</span>
                </label>
                <Input
                  value={clubName}
                  onChange={(event) => setClubName(event.target.value)}
                  placeholder="Entrez le nom du club"
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Decrivez le club, ses objectifs et activites"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Staff principal <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStaffMember}
                    className="border-[#0EA8A8] text-[#0EA8A8] hover:bg-[#0EA8A8] hover:text-white"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Ajouter un poste
                  </Button>
                </div>

                <div className="space-y-3">
                  {staffMembers.map((member) => (
                    <div key={member.id} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
                      {staffMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStaffMember(member.id)}
                          className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Nom complet</label>
                          <Input
                            value={member.name}
                            onChange={(event) => updateStaffMember(member.id, "name", event.target.value)}
                            placeholder="Nom et prenom"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(event) => updateStaffMember(member.id, "email", event.target.value)}
                            placeholder="responsable@fst.utm.tn"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Poste</label>
                          <select
                            value={member.staffTitle}
                            onChange={(event) =>
                              updateStaffMember(member.id, "staffTitle", event.target.value as StaffTitle)
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                          >
                            {STAFF_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/admin/clubs")} className="px-4">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-[#0EA8A8] px-6 hover:bg-[#0c8e8e]">
                  {isLoading ? "Creation en cours..." : "Creer le club"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
