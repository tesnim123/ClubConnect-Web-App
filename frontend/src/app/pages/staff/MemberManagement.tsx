import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Search, Trash2, UserCheck, X } from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { members as baseMembers, membershipRequests as initialRequests } from "../../data/mockData";

type MembershipRole = "member" | "staff";

export default function MemberManagement() {
  const president = baseMembers.find((member) => member.role === "president") ?? baseMembers[0];
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState(baseMembers.filter((member) => member.clubId === president.clubId));
  const [requests, setRequests] = useState(initialRequests.filter((request) => request.clubId === president.clubId));
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assignmentRole, setAssignmentRole] = useState<MembershipRole>("member");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<MembershipRole>("member");

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? null;

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        `${member.firstName} ${member.lastName} ${member.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [members, search],
  );

  const visibleRequests = useMemo(
    () =>
      requests.filter((request) =>
        `${request.firstName} ${request.lastName} ${request.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [requests, search],
  );

  const activeStaff = filteredMembers.filter((member) => ["president", "vicepresident", "staff"].includes(member.role));
  const activeMembers = filteredMembers.filter((member) => member.role === "member" && member.status === "active");

  const openApproveDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setAssignmentRole("member");
  };

  const confirmApproval = () => {
    if (!selectedRequest) return;

    setMembers((prev) => [
      ...prev,
      {
        id: `approved-${selectedRequest.id}`,
        firstName: selectedRequest.firstName,
        lastName: selectedRequest.lastName,
        email: selectedRequest.email,
        avatar: selectedRequest.avatar,
        role: assignmentRole,
        clubId: selectedRequest.clubId,
        clubName: selectedRequest.clubName,
        joinDate: new Date().toISOString().slice(0, 10),
        status: "active",
        online: false,
      },
    ]);
    setRequests((prev) => prev.filter((request) => request.id !== selectedRequest.id));
    setSelectedRequestId(null);
    toast.success(`Utilisateur ajoute a la liste ${assignmentRole === "staff" ? "staff" : "membres"}.`);
  };

  const rejectRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
    toast.success("Demande rejetee.");
  };

  const openEditDialog = (memberId: string, currentRole: MembershipRole) => {
    setEditingMemberId(memberId);
    setEditingRole(currentRole);
  };

  const saveEditedMember = () => {
    if (!editingMemberId) return;
    setMembers((prev) =>
      prev.map((member) =>
        member.id === editingMemberId
          ? { ...member, role: editingRole }
          : member,
      ),
    );
    setEditingMemberId(null);
    toast.success("Role mis a jour.");
  };

  const deleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
    toast.success("Utilisateur supprime de la liste.");
  };

  const renderMemberCard = (member: (typeof members)[number], tone: "staff" | "member") => (
    <Card key={member.id} className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>
              {member.firstName[0]}
              {member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-[#1B2A4A]">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        </div>
        <Badge className={tone === "staff" ? "bg-[#1B2A4A]" : "bg-[#0EA8A8]"}>
          {member.role}
        </Badge>
      </div>
      {member.role !== "president" && (
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => openEditDialog(member.id, tone)}>
            <Pencil className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="destructive" size="sm" onClick={() => deleteMember(member.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      )}
    </Card>
  );

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
          notificationCount={requests.length}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Membres</h1>
            <p className="text-gray-600">
              Le president valide les demandes et decide si la personne rejoint la liste des membres ou du staff.
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un nom ou un email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:flex">
              <Card className="px-4 py-3 min-w-[140px]">
                <p className="text-xs text-gray-500">Demandes</p>
                <p className="text-2xl font-bold text-[#1B2A4A]">{requests.length}</p>
              </Card>
              <Card className="px-4 py-3 min-w-[140px]">
                <p className="text-xs text-gray-500">Staff</p>
                <p className="text-2xl font-bold text-[#1B2A4A]">{activeStaff.length}</p>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="requests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="requests">Demandes</TabsTrigger>
              <TabsTrigger value="members">Membres</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              {visibleRequests.map((request) => (
                <Card key={request.id} className="p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={request.avatar} />
                        <AvatarFallback className="text-base">
                          {request.firstName[0]}
                          {request.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-lg font-bold text-[#1B2A4A]">
                            {request.firstName} {request.lastName}
                          </h2>
                        </div>
                        <p className="text-gray-600">{request.email}</p>
                        <p className="text-sm text-gray-500 mt-3 max-w-2xl">{request.motivation}</p>
                        {request.skills && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {request.skills.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[220px]">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => openApproveDialog(request.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Accepter
                      </Button>
                      <Button variant="destructive" onClick={() => rejectRequest(request.id)}>
                        <X className="w-4 h-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {visibleRequests.length === 0 && (
                <Card className="p-10 text-center text-gray-500">Aucune demande a afficher.</Card>
              )}
            </TabsContent>

            <TabsContent value="members">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {activeMembers.map((member) => renderMemberCard(member, "member"))}
                {activeMembers.length === 0 && (
                  <Card className="p-10 text-center text-gray-500 xl:col-span-2">Aucun membre trouve.</Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {activeStaff.map((member) => renderMemberCard(member, "staff"))}
                {activeStaff.length === 0 && (
                  <Card className="p-10 text-center text-gray-500 xl:col-span-2">Aucun staff trouve.</Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequestId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Valider la demande</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <p className="font-semibold text-[#1B2A4A]">
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedRequest.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">Ajouter comme</label>
                <Select value={assignmentRole} onValueChange={(value) => setAssignmentRole(value as MembershipRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membre</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 p-4 text-sm text-gray-600">
                Une fois valide, l&apos;utilisateur sera ajoute directement a la liste correspondante.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequestId(null)}>
              Annuler
            </Button>
            <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" onClick={confirmApproval}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMemberId} onOpenChange={(open) => !open && setEditingMemberId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le role</DialogTitle>
          </DialogHeader>

          <div>
            <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">Nouveau role</label>
            <Select value={editingRole} onValueChange={(value) => setEditingRole(value as MembershipRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membre</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMemberId(null)}>
              Annuler
            </Button>
            <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" onClick={saveEditedMember}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
