// pages/member/Profile.tsx
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, members, events, forumPosts } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { 
  Calendar, Mail, Shield, Users, Edit2, Camera, MapPin, Globe, 
  Linkedin, Github, Twitter, Save, X, User, Phone, Clock, 
  CheckCircle, Building, Award, MessageSquare, BookOpen
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function MemberProfile() {
  const [user, setUser] = useState(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setEditedUser(parsed);
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    setUser(editedUser);
    localStorage.setItem("user", JSON.stringify(editedUser));
    setIsEditing(false);
    toast.success("Profil mis à jour avec succès");
    // Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new Event('userUpdated'));
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedUser) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, avatar: reader.result as string });
        setIsUploading(false);
        toast.success("Avatar mis à jour");
      };
      reader.readAsDataURL(file);
    }
  };

  const memberEvents = events.filter(e => e.clubId === user.clubId);
  const memberPosts = forumPosts.filter(p => p.authorId === user.id);

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          userAvatar={user.avatar}
          userRole={user.roleLabel || "Membre"}
          userRoleType={user.role}
          notificationCount={3}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card className="overflow-hidden">
  <div className="p-9">
    <div className="flex items-start gap-6">
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-white">
          <AvatarImage src={user.avatar} alt={user.firstName} />
        </Avatar>
        {isEditing && (
          <>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200"
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            {isEditing && editedUser ? (
              <Input
                value={`${editedUser.firstName} ${editedUser.lastName}`}
                onChange={(e) => {
                  const [first, ...rest] = e.target.value.split(" ");
                  setEditedUser({ ...editedUser, firstName: first || "", lastName: rest.join(" ") || "" });
                }}
                className="text-2xl font-bold w-64"
              />
            ) : (
              <h1 className="text-2xl font-bold text-[#1B2A4A]">
                {user.firstName} {user.lastName}
              </h1>
            )}
            <p className="text-gray-600">{user.email}</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditing ? "Annuler" : "Modifier"}
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <Badge className="bg-[#0EA8A8]">{user.roleLabel || "Membre"}</Badge>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>{user.clubName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Membre depuis {format(new Date(user.joinDate), 'MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Dernière connexion: {user.lastLogin ? format(new Date(user.lastLogin), 'dd/MM/yyyy', { locale: fr }) : 'Aujourd\'hui'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</Card>

            {/* Bio */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">À propos</h2>
              {isEditing && editedUser ? (
                <textarea
                  value={editedUser.bio || ""}
                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  placeholder="Décrivez-vous en quelques mots..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                />
              ) : (
                <p className="text-gray-700">{user.bio || "Aucune bio renseignée."}</p>
              )}
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Informations personnelles</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      {isEditing && editedUser ? (
                        <Input value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} className="mt-1" />
                      ) : (
                        <p className="font-semibold text-[#1B2A4A]">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      {isEditing && editedUser ? (
                        <Input value={editedUser.phone || ""} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })} placeholder="+33 6 12 34 56 78" className="mt-1" />
                      ) : (
                        <p className="font-semibold text-[#1B2A4A]">{user.phone || "Non renseigné"}</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Localisation</p>
                      {isEditing && editedUser ? (
                        <Input value={editedUser.location || ""} onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })} placeholder="Paris, France" className="mt-1" />
                      ) : (
                        <p className="font-semibold text-[#1B2A4A]">{user.location || "Non renseigné"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Statistiques d'activité</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#0EA8A8]" />
                      <span className="text-gray-600">Événements participés</span>
                    </div>
                    <span className="text-2xl font-bold text-[#1B2A4A]">{user.stats?.eventsAttended || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-600">Posts forum</span>
                    </div>
                    <span className="text-2xl font-bold text-[#1B2A4A]">{user.stats?.forumPosts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#F5A623]" />
                      <span className="text-gray-600">Messages envoyés</span>
                    </div>
                    <span className="text-2xl font-bold text-[#1B2A4A]">{user.stats?.messagesSent || 0}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Social Links */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Réseaux sociaux</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Site web</p>
                    {isEditing && editedUser ? (
                      <Input value={editedUser.website || ""} onChange={(e) => setEditedUser({ ...editedUser, website: e.target.value })} placeholder="https://..." className="mt-1" />
                    ) : (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-[#0EA8A8] hover:underline">
                        {user.website || "Non renseigné"}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Linkedin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">LinkedIn</p>
                    {isEditing && editedUser ? (
                      <Input value={editedUser.linkedin || ""} onChange={(e) => setEditedUser({ ...editedUser, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="mt-1" />
                    ) : (
                      <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0EA8A8] hover:underline">
                        {user.linkedin || "Non renseigné"}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Github className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">GitHub</p>
                    {isEditing && editedUser ? (
                      <Input value={editedUser.github || ""} onChange={(e) => setEditedUser({ ...editedUser, github: e.target.value })} placeholder="https://github.com/..." className="mt-1" />
                    ) : (
                      <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-[#0EA8A8] hover:underline">
                        {user.github || "Non renseigné"}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Twitter className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Twitter</p>
                    {isEditing && editedUser ? (
                      <Input value={editedUser.twitter || ""} onChange={(e) => setEditedUser({ ...editedUser, twitter: e.target.value })} placeholder="https://twitter.com/..." className="mt-1" />
                    ) : (
                      <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-[#0EA8A8] hover:underline">
                        {user.twitter || "Non renseigné"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Save/Cancel buttons when editing */}
            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave} className="bg-[#0EA8A8]">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}