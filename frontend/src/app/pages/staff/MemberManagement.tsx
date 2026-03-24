import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, members } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Search, MoreVertical, UserCheck, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

export default function MemberManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const activeMembers = members.filter(m => m.status === 'active');
  const pendingMembers = members.filter(m => m.status === 'pending');

  const getRoleBadge = (role: string) => {
    const colors = {
      president: "bg-purple-500",
      vicepresident: "bg-blue-500",
      staff: "bg-[#0EA8A8]",
      member: "bg-gray-500",
    };
    return colors[role as keyof typeof colors] || colors.member;
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="staff" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={`${currentUser.firstName} ${currentUser.lastName}`}
          userAvatar={currentUser.avatar}
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Gestion des membres</h1>
            <p className="text-gray-600">Gérez les membres de {currentUser.clubName}</p>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="president">Président</SelectItem>
                <SelectItem value="vicepresident">Vice-Président</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="member">Membre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Membres actifs <Badge className="ml-2">{activeMembers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente <Badge className="ml-2 bg-[#F5A623]">{pendingMembers.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Date d'adhésion</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-[#1B2A4A]">
                                {member.firstName} {member.lastName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{member.email}</TableCell>
                        <TableCell>
                          <Badge className={`${getRoleBadge(member.role)} capitalize`}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 font-mono text-sm">
                          {format(new Date(member.joinDate), 'PP', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Actif</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <div className="space-y-4">
                {pendingMembers.map((member) => (
                  <Card key={member.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-lg">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg text-[#1B2A4A]">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-500 font-mono mt-1">
                            Demande envoyée le {format(new Date(member.joinDate), 'PP', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-green-500 hover:bg-green-600">
                          <UserCheck className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button variant="destructive">
                          <X className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
