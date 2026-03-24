import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Construction } from "lucide-react";

export default function AdminMemberManagement() {
  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav userName="Admin" notificationCount={7} />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <Construction className="w-16 h-16 text-[#0EA8A8] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Gestion globale des membres</h1>
            <p className="text-gray-600">Gérer tous les membres de tous les clubs</p>
          </Card>
        </main>
      </div>
    </div>
  );
}
