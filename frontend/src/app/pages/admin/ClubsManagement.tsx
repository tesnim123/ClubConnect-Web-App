// ClubsManagement.tsx (updated)
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { ClubCard } from "../../components/ClubCard";
import { clubs } from "../../data/mockData";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ClubsManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Gestion des clubs</h1>
              <p className="text-gray-600">Créer et gérer tous les clubs universitaires</p>
            </div>
            <Button 
              onClick={() => navigate("/admin/clubs/create")}
              className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un club
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}