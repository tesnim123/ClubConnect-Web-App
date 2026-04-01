import { Link } from "react-router";
import { Calendar, MessageSquare, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { channelJoinRequests, channels, events, forumPosts, members, membershipRequests } from "../../data/mockData";

export default function StaffDashboard() {
  const president = members.find((member) => member.role === "president") ?? members[0];
  const memberCount = members.filter((member) => member.clubId === president.clubId && member.status === "active").length;
  const eventCount = events.filter((event) => event.clubId === president.clubId).length;
  const channelCount = channels.filter((channel) => !channel.clubId || channel.clubId === president.clubId).length;
  const postCount = forumPosts.filter((post) => post.clubId === president.clubId).length;
  const pendingJoinRequests = membershipRequests.filter((request) => request.clubId === president.clubId).length;
  const pendingChannelRequests = channelJoinRequests.filter((request) => request.status === "pending").length;

  return (
    <div className="flex h-screen">
      <Sidebar role="president" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userId={president.id}
          userName={`${president.firstName} ${president.lastName}`}
          userAvatar={president.avatar}
          userRole="President"
          userRoleType="staff"
          notificationCount={pendingJoinRequests + pendingChannelRequests}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="bg-[#0EA8A8] mb-3">Role president</Badge>
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Dashboard du club</h1>
              <p className="text-gray-600">
                Vue d&apos;ensemble sur les membres, les evenements, les canaux et le forum.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
                <Link to="/staff/event/new">Ajouter un evenement</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/staff/members">Traiter les demandes</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0EA8A8]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#0EA8A8]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membres actifs</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{memberCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Demandes d&apos;adhesion</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{pendingJoinRequests}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Evenements</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{eventCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Canaux et forum</p>
                  <p className="text-3xl font-bold text-[#1B2A4A]">{channelCount + postCount}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="p-6 xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1B2A4A]">Priorites</h2>
                <Badge variant="outline">{pendingJoinRequests + pendingChannelRequests} en attente</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-[#1B2A4A] mb-1">Membres</p>
                  <p className="text-sm text-gray-600">
                    {pendingJoinRequests} demande(s) d&apos;adhesion a valider.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-[#1B2A4A] mb-1">Canaux</p>
                  <p className="text-sm text-gray-600">
                    {pendingChannelRequests} demande(s) d&apos;acces a traiter.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-[#1B2A4A] mb-1">Forum</p>
                  <p className="text-sm text-gray-600">{postCount} publication(s) visibles dans le club.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#1B2A4A]" />
                <h2 className="text-xl font-bold text-[#1B2A4A]">Acces president</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  Validation des adhesions avec affectation membre ou staff.
                </p>
                <p className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  Consultation et creation des evenements et workshops du club.
                </p>
                <p className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  Gestion des canaux, invitations et publications forum.
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
