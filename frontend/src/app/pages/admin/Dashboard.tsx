import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { clubs, members, events } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Building2, Users, Calendar, AlertCircle, TrendingUp, Download } from "lucide-react";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
  const pendingEvents = events.filter(e => e.status === 'pending').length;

  const eventsPerClub = clubs.map(club => ({
    name: club.name.split(' ')[1] || club.name,
    events: events.filter(e => e.clubId === club.id).length,
  }));

  const membersDistribution = clubs.map(club => ({
    name: club.name.split(' ')[1] || club.name,
    value: club.memberCount,
  }));

  const COLORS = ['#0EA8A8', '#1B2A4A', '#F5A623', '#10B981', '#8B5CF6'];

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Tableau de bord Administrateur</h1>
            <p className="text-gray-600">Vue d'ensemble de tous les clubs</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0EA8A8]/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#0EA8A8]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clubs actifs</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{clubs.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Membres totaux</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{totalMembers}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Événements ce mois</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{events.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Demandes en attente</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{pendingEvents}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Events Per Club Chart */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Événements par club</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventsPerClub}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="#0EA8A8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Members Distribution */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Distribution des membres</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membersDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membersDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Activité récente</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1B2A4A]">Nouveau club créé</p>
                  <p className="text-sm text-gray-600">Club Photographie a été créé avec succès</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-[#0EA8A8]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-[#0EA8A8]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1B2A4A]">Événement approuvé</p>
                  <p className="text-sm text-gray-600">Compétition de Robots - Club Robotique</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Il y a 5 heures</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1B2A4A]">Nouveaux membres</p>
                  <p className="text-sm text-gray-600">15 nouveaux membres ont rejoint différents clubs</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Hier</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-auto py-6 bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
                <Link to="/admin/clubs">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="w-8 h-8" />
                    <span>Créer un club</span>
                  </div>
                </Link>
              </Button>
              <Button className="h-auto py-6 bg-[#1B2A4A] hover:bg-[#2D3E5F]" asChild>
                <Link to="/admin/events">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8" />
                    <span>Voir les demandes</span>
                  </div>
                </Link>
              </Button>
              <Button className="h-auto py-6 bg-[#F5A623] hover:bg-[#e09615]" asChild>
                <Link to="/admin/statistics">
                  <div className="flex flex-col items-center gap-2">
                    <Download className="w-8 h-8" />
                    <span>Télécharger rapport</span>
                  </div>
                </Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
