import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, ApiClientError } from "../../lib/api";

export default function CreateClub() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [presidentName, setPresidentName] = useState("");
  const [presidentEmail, setPresidentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiRequest("/admin/clubs", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: clubName,
          description,
          presidentName,
          presidentEmail,
        }),
      });

      toast.success("Club créé avec succès. Les identifiants du président ont été envoyés par email.");
      navigate("/admin/clubs");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Une erreur est survenue";
      setError(message);
      toast.error(message);
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
          notificationCount={0}
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

            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#1B2A4A]">Créer un club</h1>
              <p className="text-gray-600">Le président est créé automatiquement et reçoit ses accès par email.</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nom du club</label>
                <Input value={clubName} onChange={(event) => setClubName(event.target.value)} placeholder="Nom du club" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Description du club"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Nom du président</label>
                  <Input
                    value={presidentName}
                    onChange={(event) => setPresidentName(event.target.value)}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email du président</label>
                  <Input
                    type="email"
                    value={presidentEmail}
                    onChange={(event) => setPresidentEmail(event.target.value)}
                    placeholder="president@clubconnect.tn"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              ) : null}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/admin/clubs")}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                  {isLoading ? "Création..." : "Créer le club"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}