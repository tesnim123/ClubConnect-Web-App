import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  Download,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { clubs, events } from "../../data/mockData";

export default function AdminDashboard() {
  const { user } = useAuth();
  const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
  const pendingEvents = events.filter((event) => event.status === "pending").length;

  const eventsPerClub = clubs.map((club) => ({
    name: club.name.split(" ")[1] || club.name,
    events: events.filter((event) => event.clubId === club.id).length,
  }));

  const membersDistribution = clubs.map((club) => ({
    name: club.name.split(" ")[1] || club.name,
    value: club.memberCount,
  }));

  const colors = ["#0EA8A8", "#1B2A4A", "#F5A623", "#10B981", "#2563EB"];

  return (
    <div className="flex h-screen bg-[#EEF4F6]">
      <Sidebar role="admin" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          userId={user?._id}
          userName={user?.name ?? "Admin User"}
          userRole="Administrateur"
          userRoleType="admin"
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <section className="mb-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#10233F_0%,#17375E_48%,#0EA8A8_100%)] p-8 text-white shadow-[0_24px_70px_rgba(16,35,63,0.24)]">
            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80">
                  <ShieldCheck className="h-4 w-4" />
                  Administration centrale
                </div>
                <h1 className="text-4xl font-bold">
                  Bonjour {user?.name?.split(" ")[0] ?? "Admin"}, pilotez l'écosystème des clubs.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
                  Suivez l'activité réseau, les demandes à traiter et la dynamique des clubs depuis une vue plus actuelle et plus orientée action.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button className="rounded-2xl bg-white text-[#10233F] hover:bg-slate-100" asChild>
                    <Link to="/admin/clubs/create">
                      Créer un club
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-2xl border-white/30 bg-transparent text-white hover:bg-white/10" asChild>
                    <Link to="/admin/events">Voir les demandes</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/70">Taux d'activité clubs</p>
                  <p className="mt-3 text-4xl font-bold">87%</p>
                  <p className="mt-2 text-sm text-emerald-200">Progression sur les 30 derniers jours</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/70">Points d'attention</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-[#F5A623]" />
                    <p className="text-sm text-white/85">{pendingEvents} demandes en attente</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#10233F]">Vue d'ensemble</h2>
            <p className="text-gray-600">Tous les indicateurs utiles pour encadrer les clubs et leurs activités.</p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="rounded-[1.5rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0EA8A8]/10">
                  <Building2 className="h-6 w-6 text-[#0EA8A8]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clubs actifs</p>
                  <p className="text-3xl font-bold text-[#10233F]">{clubs.length}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[1.5rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Membres totaux</p>
                  <p className="text-3xl font-bold text-[#10233F]">{totalMembers}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[1.5rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Événements ce mois</p>
                  <p className="text-3xl font-bold text-[#10233F]">{events.length}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[1.5rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5A623]/10">
                  <AlertCircle className="h-6 w-6 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Demandes en attente</p>
                  <p className="text-3xl font-bold text-[#10233F]">{pendingEvents}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <Card className="rounded-[1.75rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-xl font-bold text-[#10233F]">Événements par club</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventsPerClub}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="#0EA8A8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="rounded-[1.75rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <h2 className="mb-4 text-xl font-bold text-[#10233F]">Distribution des membres</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membersDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {membersDistribution.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="mb-6 rounded-[1.75rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="mb-4 text-xl font-bold text-[#10233F]">Activité récente</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 border-b pb-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#10233F]">Nouveau club créé</p>
                  <p className="text-sm text-gray-600">Club Photographie créé avec succès</p>
                  <p className="mt-1 text-xs text-gray-400">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-b pb-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0EA8A8]/10">
                  <Calendar className="h-5 w-5 text-[#0EA8A8]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#10233F]">Événement approuvé</p>
                  <p className="text-sm text-gray-600">Compétition de Robots - Club Robotique</p>
                  <p className="mt-1 text-xs text-gray-400">Il y a 5 heures</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#10233F]">Nouveaux membres</p>
                  <p className="text-sm text-gray-600">15 nouveaux membres ont rejoint différents clubs</p>
                  <p className="mt-1 text-xs text-gray-400">Hier</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[1.75rem] border-0 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="mb-4 text-xl font-bold text-[#10233F]">Actions rapides</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button className="h-auto bg-[#0EA8A8] py-6 hover:bg-[#0c8e8e]" asChild>
                <Link to="/admin/clubs/create">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-8 w-8" />
                    <span>Créer un club</span>
                  </div>
                </Link>
              </Button>
              <Button className="h-auto bg-[#1B2A4A] py-6 hover:bg-[#2D3E5F]" asChild>
                <Link to="/admin/events">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8" />
                    <span>Voir les demandes</span>
                  </div>
                </Link>
              </Button>
              <Button className="h-auto bg-[#F5A623] py-6 hover:bg-[#e09615]" asChild>
                <Link to="/admin/statistics">
                  <div className="flex flex-col items-center gap-2">
                    <Download className="h-8 w-8" />
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