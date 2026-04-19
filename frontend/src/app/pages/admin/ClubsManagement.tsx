import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { ClubCard } from "../../components/ClubCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import type { AdminClub } from "../../types/club";

export default function ClubsManagement() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const response = await apiRequest<{ items: AdminClub[] }>("/admin/clubs", {
          method: "GET",
          token,
        });
        setClubs(response.items);
      } finally {
        setLoading(false);
      }
    };

    void loadClubs();
  }, [token]);

  const filteredClubs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return clubs;
    }

    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query)
    );
  }, [clubs, searchQuery]);

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userId={user?._id}
          userName={user?.name ?? "Admin User"}
          userRole="Administrateur"
          userRoleType="admin"
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#1B2A4A]">Gestion des clubs</h1>
              <p className="text-gray-600">Créer et gérer les clubs de la Faculté des Sciences de Tunis</p>
            </div>
            <Button onClick={() => navigate("/admin/clubs/create")} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
              <Plus className="mr-2 h-4 w-4" />
              Créer un club
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un club..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Chargement des clubs...</div>
          ) : filteredClubs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
              Aucun club enregistré pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club) => (
                <ClubCard key={club._id} club={club} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}