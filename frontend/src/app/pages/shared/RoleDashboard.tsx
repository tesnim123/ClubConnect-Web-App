import { Link } from "react-router";
import { Building2, Calendar, CheckCircle2, Clock3, Hash, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { getRoleLabel, getRoleSection } from "../../lib/role";
import type { AdminClub, Channel, ClubPost } from "../../types/club";
import type { AuthUser } from "../../types/auth";

type PendingResponse = { items: AuthUser[] };

export default function RoleDashboard() {
  const { user, token } = useAuth();
  const section = getRoleSection(user?.role);
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [pendingMembers, setPendingMembers] = useState<AuthUser[]>([]);
  const [publicEvents, setPublicEvents] = useState<ClubPost[]>([]);
  const [pendingPosts, setPendingPosts] = useState<ClubPost[]>([]);

  useEffect(() => {
    const load = async () => {
      const jobs: Promise<unknown>[] = [
        apiRequest<{ items: ClubPost[] }>("/posts/public/events").then((response) => setPublicEvents(response.items.slice(0, 5))),
      ];

      if (token) {
        jobs.push(apiRequest<{ items: Channel[] }>("/channels/my", { token }).then((response) => setChannels(response.items)));
      }

      if (section === "admin" && token) {
        jobs.push(apiRequest<{ items: AdminClub[] }>("/admin/clubs", { token }).then((response) => setClubs(response.items)));
        jobs.push(apiRequest<{ items: ClubPost[] }>("/admin/posts/pending", { token }).then((response) => setPendingPosts(response.items)));
      }

      if (section === "president" && token) {
        jobs.push(apiRequest<PendingResponse>("/president/pending-members", { token }).then((response) => setPendingMembers(response.items)));
      }

      await Promise.allSettled(jobs);
    };

    void load();
  }, [section, token]);

  const myClubName = typeof user?.club === "object" ? user.club?.name : null;
  const totalMembers = useMemo(() => clubs.reduce((sum, club) => sum + club.members.length, 0), [clubs]);

  const stats = section === "admin"
    ? [
        { label: "Clubs", value: clubs.length, icon: Building2 },
        { label: "Membres", value: totalMembers, icon: Users },
        { label: "Posts en attente", value: pendingPosts.length, icon: Clock3 },
        { label: "Events publics", value: publicEvents.length, icon: Calendar },
      ]
    : [
        { label: "Canaux", value: channels.length, icon: Hash },
        { label: "Events visibles", value: publicEvents.length, icon: Calendar },
        {
          label: section === "president" ? "Membres en attente" : "Acces actif",
          value: section === "president" ? pendingMembers.length : user?.status === "ACCEPTED" ? 1 : 0,
          icon: section === "president" ? Clock3 : CheckCircle2,
        },
        { label: "Role", value: getRoleLabel(user?.role), icon: ShieldCheck },
      ];

  return (
    <AppShell
      title={`Tableau de bord ${getRoleLabel(user?.role)}`}
      description={
        section === "admin"
          ? "Vue centrale de la plateforme, des clubs et de la moderation."
          : `Bienvenue ${user?.name ?? ""}${myClubName ? `, club ${myClubName}.` : "."}`
      }
      actions={
        section === "admin" ? (
          <>
            <Button asChild className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
              <Link to="/admin/clubs/create">Creer un club</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/forums">Moderer les posts</Link>
            </Button>
          </>
        ) : section === "president" ? (
          <>
            <Button asChild className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
              <Link to="/president/members">Gerer les membres</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/president/channels">Canaux</Link>
            </Button>
          </>
        ) : (
          <Button asChild className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
            <Link to={`/${section === "staff" ? "staff" : "member"}/forum`}>Ouvrir le forum</Link>
          </Button>
        )
      }
      sectionOverride={section}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0EA8A8]/10">
                <Icon className="h-6 w-6 text-[#0EA8A8]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-[#10233F]">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="mb-4 text-xl font-bold text-[#10233F]">
            {section === "admin" ? "Clubs recents" : "Events publics"}
          </h2>
          <div className="space-y-3">
            {section === "admin"
              ? clubs.slice(0, 5).map((club) => (
                  <div key={club._id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="font-semibold text-[#10233F]">{club.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{club.staff.length} staff, {club.members.length} membres</p>
                  </div>
                ))
              : publicEvents.map((event) => (
                  <div key={event._id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="font-semibold text-[#10233F]">{event.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{event.club.name}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{event.content}</p>
                  </div>
                ))}

            {(section === "admin" ? clubs.length : publicEvents.length) === 0 ? (
              <p className="text-sm text-gray-500">Aucune donnee disponible.</p>
            ) : null}
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="mb-4 text-xl font-bold text-[#10233F]">
            {section === "admin" ? "Posts a moderer" : section === "president" ? "Demandes en attente" : "Vos canaux"}
          </h2>
          <div className="space-y-3">
            {section === "admin" && pendingPosts.map((post) => (
              <div key={post._id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-[#10233F]">{post.title}</p>
                <p className="mt-1 text-sm text-gray-500">{post.author.name} · {post.club.name}</p>
              </div>
            ))}

            {section === "president" && pendingMembers.map((member) => (
              <div key={member._id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-[#10233F]">{member.name}</p>
                <p className="mt-1 text-sm text-gray-500">{member.email}</p>
              </div>
            ))}

            {section !== "admin" && section !== "president" && channels.map((channel) => (
              <div key={channel._id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-[#10233F]">{channel.name}</p>
                <p className="mt-1 text-sm text-gray-500">{channel.type}</p>
              </div>
            ))}

            {((section === "admin" && pendingPosts.length === 0) ||
              (section === "president" && pendingMembers.length === 0) ||
              (section !== "admin" && section !== "president" && channels.length === 0)) && (
              <p className="text-sm text-gray-500">Rien a signaler pour le moment.</p>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
