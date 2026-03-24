import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { clubs, events } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Download, TrendingUp, Users, Calendar, Building2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Statistics() {
  const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
  const avgParticipation = 92; // Mock

  const memberGrowthData = [
    { month: 'Sept', total: 120 },
    { month: 'Oct', total: 135 },
    { month: 'Nov', total: 148 },
    { month: 'Déc', total: 152 },
    { month: 'Jan', total: 157 },
    { month: 'Fév', total: 162 },
    { month: 'Mars', total: totalMembers },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav userName="Admin" notificationCount={7} />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Statistiques et Rapports</h1>
              <p className="text-gray-600">Analyse détaillée de l'activité des clubs</p>
            </div>
            <div className="flex gap-3">
              <Select defaultValue="semester">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="semester">Ce semestre</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Télécharger CSV
              </Button>
            </div>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#0EA8A8]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#0EA8A8]" />
                </div>
                <p className="text-sm text-gray-600">Clubs actifs</p>
              </div>
              <p className="text-3xl font-bold text-[#1B2A4A]">{clubs.length}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +2 ce mois
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600">Membres totaux</p>
              </div>
              <p className="text-3xl font-bold text-[#1B2A4A]">{totalMembers}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +15 ce mois
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600">Événements</p>
              </div>
              <p className="text-3xl font-bold text-[#1B2A4A]">{events.length}</p>
              <p className="text-sm text-gray-600 mt-1">Ce semestre</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#F5A623]" />
                </div>
                <p className="text-sm text-gray-600">Taux participation</p>
              </div>
              <p className="text-3xl font-bold text-[#1B2A4A]">{avgParticipation}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +5% vs mois dernier
              </p>
            </Card>
          </div>

          {/* Member Growth Chart */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Croissance des membres (12 derniers mois)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#0EA8A8" strokeWidth={2} name="Membres totaux" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Clubs Table */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Top 5 clubs les plus actifs</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Club</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Membres</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Événements</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <tr key={club.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={club.logo} alt={club.name} className="w-8 h-8 rounded" />
                          <span className="font-semibold text-[#1B2A4A]">{club.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{club.memberCount}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {events.filter(e => e.clubId === club.id).length}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {Math.floor(Math.random() * 500) + 200}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
