import { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { Calendar, MessageSquare, Users, Edit2, Mail, Shield } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MemberProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
  });

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={`${currentUser.firstName} ${currentUser.lastName}`}
          userAvatar={currentUser.avatar}
          notificationCount={3}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <Card className="overflow-hidden mb-6">
              <div className="h-32 bg-gradient-to-r from-[#1B2A4A] to-[#0EA8A8]"></div>
              <div className="p-6">
                <div className="flex items-start gap-6 -mt-16">
                  <Avatar className="w-24 h-24 border-4 border-white">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="text-2xl">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 pt-16">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-[#1B2A4A]">
                          {currentUser.firstName} {currentUser.lastName}
                        </h1>
                        <p className="text-gray-600">{currentUser.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier le profil
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className="bg-[#0EA8A8] capitalize">{currentUser.role}</Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span>{currentUser.clubName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Membre depuis {format(new Date(currentUser.joinDate), 'MMMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Informations personnelles</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsEditing(false)}
                        className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                      >
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
                        <p className="font-semibold text-[#1B2A4A]">{currentUser.email}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Club</p>
                        <p className="font-semibold text-[#1B2A4A]">{currentUser.clubName}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Membre depuis</p>
                        <p className="font-semibold text-[#1B2A4A]">
                          {format(new Date(currentUser.joinDate), 'PPP', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Activity Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Statistiques d'activité</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0EA8A8]/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#0EA8A8]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Événements participés</p>
                        <p className="text-2xl font-bold text-[#1B2A4A]">8</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Posts forum</p>
                        <p className="text-2xl font-bold text-[#1B2A4A]">23</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#F5A623]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Messages envoyés</p>
                        <p className="text-2xl font-bold text-[#1B2A4A]">156</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Notifications Settings */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Préférences de notification</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1B2A4A]">Notifications événements</p>
                    <p className="text-sm text-gray-600">Recevoir des rappels pour les événements à venir</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1B2A4A]">Notifications forum</p>
                    <p className="text-sm text-gray-600">Être notifié des nouveaux posts et commentaires</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1B2A4A]">Messages directs</p>
                    <p className="text-sm text-gray-600">Recevoir des notifications pour les nouveaux messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
