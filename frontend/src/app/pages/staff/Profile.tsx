import { useState } from "react";
import { Calendar, Edit2, Mail, Shield, Users } from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { members } from "../../data/mockData";

export default function StaffProfile() {
  const president = members.find((member) => member.role === "president") ?? members[0];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: president.firstName,
    lastName: president.lastName,
    email: president.email,
  });

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
          notificationCount={3}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden mb-6">
              <div className="h-32 bg-gradient-to-r from-[#1B2A4A] to-[#0EA8A8]"></div>
              <div className="p-6">
                <div className="flex items-start gap-6 -mt-16">
                  <Avatar className="w-24 h-24 border-4 border-white">
                    <AvatarImage src={president.avatar} />
                    <AvatarFallback className="text-2xl">
                      {president.firstName[0]}
                      {president.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 pt-16">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-[#1B2A4A]">
                          {president.firstName} {president.lastName}
                        </h1>
                        <p className="text-gray-600">{president.email}</p>
                      </div>
                      <Button variant="outline" onClick={() => setIsEditing((prev) => !prev)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier le profil
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className="bg-[#1B2A4A]">President</Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span>{president.clubName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Depuis {president.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Informations personnelles</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">Prenom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                        Enregistrer
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-[#1B2A4A]">{president.email}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="font-semibold text-[#1B2A4A]">President du club</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Club</p>
                        <p className="font-semibold text-[#1B2A4A]">{president.clubName}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1B2A4A]">Notifications des demandes</p>
                      <p className="text-sm text-gray-600">Recevoir les nouvelles adhesions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1B2A4A]">Notifications forum</p>
                      <p className="text-sm text-gray-600">Suivre les nouvelles publications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1B2A4A]">Notifications canaux</p>
                      <p className="text-sm text-gray-600">Recevoir les alertes importantes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
