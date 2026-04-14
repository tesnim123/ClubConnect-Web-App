// pages/admin/Profile.tsx
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { events, forumPosts } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { 
  Calendar, Mail, Edit2, Camera, MapPin, Globe, Linkedin, Github, Twitter, Save, X, Phone, Clock, Building, MessageSquare, BookOpen, Users, PlusCircle, Eye, Layout 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function AdminProfile() {
  const { user: authUser } = useAuth();
  const adminUser = {
    id: "1",
    firstName: "Alex",
    lastName: "Martin",
    email: "alex.martin@admin.com",
    phone: "+33 6 98 76 54 32",
    location: "Lyon, France",
    avatar: "",
    bio: "Administrateur principal de la plateforme. En charge de la gestion globale des clubs, de la validation des activités et du support technique.",
    role: "administrateur",
    joinDate: new Date("2022-01-15").toISOString(),
    lastLogin: new Date().toISOString(),
    stats: { 
      clubsManaged: 8,      // Nombre de clubs gérés
      forumsCreated: 15,    // Forums créés
      channelsManaged: 24,  // Canaux gérés
      totalMembers: 342     // Membres totaux des clubs
    },
    website: "https://admin-portal.fr",
    linkedin: "https://linkedin.com/in/alexmartin",
    github: "https://github.com/alexmartin",
    twitter: "https://twitter.com/alexmartin"
  };

  const [user, setUser] = useState(adminUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(adminUser);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    const [firstName = "Admin", ...rest] = authUser.name.split(" ");
    const nextUser = {
      ...adminUser,
      id: authUser._id,
      firstName,
      lastName: rest.join(" ") || "User",
      email: authUser.email,
    };

    setUser(nextUser);
    setEditedUser(nextUser);
  }, [authUser]);

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    toast.success("Profil mis à jour avec succès");
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={authUser?._id ?? user.id}
          userName={authUser?.name ?? `${user.firstName} ${user.lastName}`}
          userAvatar={user.avatar}
          userRole="Administrateur"
          userRoleType="admin"
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
                      <AvatarImage 
                        src={ user.avatar} 
                        alt={`${user.firstName} ${user.lastName}`} 
                      />
                      
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
                          className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-gray-600" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={editedUser.firstName}
                              onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                              className="text-2xl font-bold w-64"
                              placeholder="Prénom"
                            />
                            <Input
                              value={editedUser.lastName}
                              onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                              className="text-2xl font-bold w-64"
                              placeholder="Nom"
                            />
                          </div>
                        ) : (
                          <h1 className="text-2xl font-bold text-[#1B2A4A]">Admin User</h1>
                        )}
                        <p className="text-gray-600">adminuser@admin.com</p>
                      </div>
                      <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        {isEditing ? "Annuler" : "Modifier"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <Badge className="bg-[#0EA8A8]">Administrateur</Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>Super Administrateur</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Membre depuis {format(new Date(user.joinDate), 'MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Dernière connexion: {format(new Date(user.lastLogin), 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bio */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">À propos</h2>
              {isEditing ? (
                <textarea
                  value={editedUser.bio || ""}
                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  placeholder="Décrivez votre rôle d'administrateur..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">Administrateur principal de la plateforme. En charge de la gestion globale des clubs, de la validation des activités et du support technique.</p>
              )}
            </Card>

            {/* Personal Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Informations personnelles</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email</p>
                    {isEditing ? (
                      <Input value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="font-semibold text-[#1B2A4A]">{user.email}</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Téléphone</p>
                    {isEditing ? (
                      <Input value={editedUser.phone} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="font-semibold text-[#1B2A4A]">{user.phone}</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Localisation</p>
                    {isEditing ? (
                      <Input value={editedUser.location} onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="font-semibold text-[#1B2A4A]">{user.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Admin Activity Stats - Updated */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#0EA8A8]" />
                Activité d'administration
              </h2>
              <p className="text-sm text-gray-500 mb-4">En tant qu'administrateur, vous gérez l'ensemble des clubs et leurs ressources</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0EA8A8]/10 to-transparent rounded-lg border border-[#0EA8A8]/20">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#0EA8A8]" />
                    <div>
                      <p className="text-sm text-gray-600">Clubs gérés</p>
                      <p className="text-xs text-gray-400">Création et supervision</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-[#1B2A4A]">{user.stats.clubsManaged}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Forums créés</p>
                      <p className="text-xs text-gray-400">Espaces de discussion</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-[#1B2A4A]">{user.stats.forumsCreated}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Canaux gérés</p>
                      <p className="text-xs text-gray-400">Salons de discussion</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-[#1B2A4A]">{user.stats.channelsManaged}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Membres totaux</p>
                      <p className="text-xs text-gray-400">À travers tous les clubs</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-[#1B2A4A]">{user.stats.totalMembers}</span>
                </div>
              </div>
            </Card>

            {/* Admin Actions Card */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#0EA8A8]" />
                Actions d'administration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e] text-white justify-start gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Créer un nouveau club
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Eye className="w-4 h-4" />
                  Gérer les forums
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Layout className="w-4 h-4" />
                  Gérer les canaux
                </Button>
              </div>
            </Card>

            {/* Social Links */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Réseaux sociaux</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { Icon: Globe, label: "Site web", value: "https://adminuser.com", key: "website" },
                  { Icon: Linkedin, label: "LinkedIn", value: "https://linkedin.com/in/adminuser", key: "linkedin" },
                  { Icon: Github, label: "GitHub", value: "https://github.com/adminuser", key: "github" },
                  { Icon: Twitter, label: "Twitter", value: "https://twitter.com/adminuser", key: "twitter" },
                ].map(({ Icon, label, value, key }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{label}</p>
                      {isEditing ? (
                        <Input
                          value={value || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, [key]: e.target.value })}
                          placeholder={`https://...`}
                          className="mt-1"
                        />
                      ) : (
                        value ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#0EA8A8] hover:underline break-all">
                            {value}
                          </a>
                        ) : (
                          <span className="text-gray-400">Non renseigné</span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Save/Cancel */}
            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
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
