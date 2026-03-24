import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Construction } from "lucide-react";

export default function EventRequestsList() {
  return (
    <div className="flex h-screen">
      <Sidebar role="staff" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={`${currentUser.firstName} ${currentUser.lastName}`}
          userAvatar={currentUser.avatar}
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <Construction className="w-16 h-16 text-[#0EA8A8] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Liste des demandes d'événements</h1>
            <p className="text-gray-600">Voir toutes les demandes d'événements du club</p>
          </Card>
        </main>
      </div>
    </div>
  );
}
