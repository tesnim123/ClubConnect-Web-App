// pages/Profile.tsx
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  Edit, 
  Save, 
  X,
  Camera,
  Shield,
  Users,
  Clock,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  ArrowLeft
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'member';
  roleLabel: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  joinDate: string;
  lastLogin: string;
  clubs: ClubMembership[];
}

interface ClubMembership {
  clubId: string;
  clubName: string;
  role: string;
  joinDate: string;
}

// Données d'exemple pour différents utilisateurs
const usersData: { [key: string]: UserProfile } = {
  "admin_1": {
    id: "admin_1",
    fullName: "Admin User",
    email: "admin@example.com",
    phone: "+33 6 12 34 56 78",
    role: "admin",
    roleLabel: "Administrateur",
    avatar: "",
    bio: "Administrateur de la plateforme Club Connect. Passionné par la technologie et l'innovation dans l'éducation.",
    location: "Paris, France",
    website: "https://admin.example.com",
    linkedin: "https://linkedin.com/in/admin",
    github: "https://github.com/admin",
    twitter: "https://twitter.com/admin",
    joinDate: "2024-01-01",
    lastLogin: new Date().toISOString(),
    clubs: [
      { clubId: "club1", clubName: "Club d'Informatique", role: "Superviseur", joinDate: "2024-01-01" },
      { clubId: "club2", clubName: "Club Sportif", role: "Superviseur", joinDate: "2024-01-01" },
      { clubId: "club3", clubName: "Club Artistique", role: "Superviseur", joinDate: "2024-01-01" }
    ]
  },
  "staff_1": {
    id: "staff_1",
    fullName: "Marie Martin",
    email: "marie.martin@example.com",
    phone: "+33 6 98 76 54 32",
    role: "staff",
    roleLabel: "Staff",
    avatar: "",
    bio: "Responsable du Club d'Informatique, passionnée par la programmation et l'enseignement.",
    location: "Lyon, France",
    website: "",
    linkedin: "https://linkedin.com/in/marie",
    github: "https://github.com/marie",
    twitter: "",
    joinDate: "2024-01-15",
    lastLogin: new Date().toISOString(),
    clubs: [
      { clubId: "club1", clubName: "Club d'Informatique", role: "Staff", joinDate: "2024-01-15" }
    ]
  },
  "member_1": {
    id: "member_1",
    fullName: "Pierre Durand",
    email: "pierre.durand@example.com",
    phone: "+33 6 23 45 67 89",
    role: "member",
    roleLabel: "Membre",
    avatar: "",
    bio: "Étudiant en informatique, passionné par le développement web et les nouvelles technologies.",
    location: "Marseille, France",
    website: "https://pierre.dev",
    linkedin: "https://linkedin.com/in/pierre",
    github: "https://github.com/pierre",
    twitter: "https://twitter.com/pierre",
    joinDate: "2024-02-01",
    lastLogin: new Date().toISOString(),
    clubs: [
      { clubId: "club1", clubName: "Club d'Informatique", role: "Membre", joinDate: "2024-02-01" },
      { clubId: "club3", clubName: "Club Artistique", role: "Membre", joinDate: "2024-02-15" }
    ]
  }
};

export default function Profile() {
  const { id, role } = useParams<{ id: string; role?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Déterminer le rôle depuis l'URL ou l'utilisateur
  const getUserRole = () => {
    if (role) return role;
    if (profile) return profile.role;
    return 'member';
  };

  // Récupérer les données du profil en fonction de l'ID
  useEffect(() => {
    setIsLoading(true);
    // Simuler un chargement API
    setTimeout(() => {
      const userData = usersData[id || "member_1"];
      if (userData) {
        setProfile(userData);
        setEditedProfile(userData);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleSave = () => {
    if (editedProfile) {
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès");
      // Ici, vous feriez un appel API pour sauvegarder les modifications
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedProfile) {
      setIsUploading(true);
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditedProfile({ ...editedProfile, avatar: reader.result as string });
          setIsUploading(false);
          toast.success("Avatar mis à jour");
        };
        reader.readAsDataURL(file);
      }, 500);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return "bg-purple-100 text-purple-800";
      case 'staff': return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSidebarRole = () => {
    if (!profile) return 'member';
    if (profile.role === 'admin') return 'admin';
    if (profile.role === 'staff') return 'staff';
    return 'member';
  };

  const getBasePath = () => {
    const userRole = getUserRole();
    if (userRole === 'admin') return '/admin/dashboard';
    if (userRole === 'staff') return '/staffdashboard';
    return '/member/dashboard';
  };

  const InfoField = ({ 
    label, 
    value, 
    icon: Icon, 
    field, 
    type = "text",
    placeholder 
  }: { 
    label: string; 
    value: string; 
    icon: any; 
    field: keyof UserProfile;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {isEditing && editedProfile ? (
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type={type}
            value={editedProfile[field] as string || ""}
            onChange={(e) => setEditedProfile({ ...editedProfile, [field]: e.target.value })}
            placeholder={placeholder || `Entrez votre ${label.toLowerCase()}`}
            className="pl-10"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Icon className="w-4 h-4 text-gray-400" />
          <span>{value || "Non renseigné"}</span>
        </div>
      )}
    </div>
  );

  const SocialField = ({ 
    label, 
    value, 
    icon: Icon, 
    field, 
    placeholder 
  }: { 
    label: string; 
    value: string; 
    icon: any; 
    field: keyof UserProfile;
    placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {isEditing && editedProfile ? (
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={editedProfile[field] as string || ""}
            onChange={(e) => setEditedProfile({ ...editedProfile, [field]: e.target.value })}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
      ) : (
        value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-[#0EA8A8] hover:underline truncate">{value}</span>
          </a>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Non renseigné</span>
          </div>
        )
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar role={getSidebarRole()} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#0EA8A8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen">
        <Sidebar role="member" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">Profil non trouvé</h2>
            <p className="text-gray-600 mb-4">L'utilisateur que vous recherchez n'existe pas.</p>
            <Button onClick={() => navigate(getBasePath())} className="bg-[#0EA8A8]">
              Retour
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar role={getSidebarRole()} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={profile.id}
          userName={profile.fullName} 
          userRole={profile.roleLabel}
          userRoleType={profile.role}
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Bouton retour */}
            <button
              onClick={() => navigate(getBasePath())}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            {/* En-tête du profil */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[#0EA8A8] to-[#1B2A4A] text-white text-2xl">
                        {profile.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
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
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isEditing && editedProfile ? (
                        <Input
                          value={editedProfile.fullName}
                          onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                          className="text-2xl font-bold w-64"
                        />
                      ) : (
                        <h1 className="text-2xl font-bold text-[#1B2A4A]">{profile.fullName}</h1>
                      )}
                      <Badge className={getRoleColor(profile.role)}>{profile.roleLabel}</Badge>
                    </div>
                    {isEditing && editedProfile ? (
                      <textarea
                        value={editedProfile.bio || ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        placeholder="Décrivez-vous en quelques mots..."
                        rows={2}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                      />
                    ) : (
                      <p className="text-gray-600 mb-2">{profile.bio || "Aucune bio"}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Membre depuis {new Date(profile.joinDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Dernière connexion: {new Date(profile.lastLogin).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="border-[#0EA8A8] text-[#0EA8A8]">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier le profil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline">
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
            </Card>

            {/* Informations personnelles */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Informations personnelles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Nom complet"
                  value={profile.fullName}
                  icon={User}
                  field="fullName"
                  placeholder="Jean Dupont"
                />
                <InfoField
                  label="Email"
                  value={profile.email}
                  icon={Mail}
                  field="email"
                  type="email"
                  placeholder="jean@example.com"
                />
                <InfoField
                  label="Téléphone"
                  value={profile.phone || ""}
                  icon={Phone}
                  field="phone"
                  placeholder="+33 6 12 34 56 78"
                />
                <InfoField
                  label="Localisation"
                  value={profile.location || ""}
                  icon={MapPin}
                  field="location"
                  placeholder="Paris, France"
                />
              </div>
            </Card>

            {/* Réseaux sociaux */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Réseaux sociaux</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SocialField
                  label="Site web"
                  value={profile.website || ""}
                  icon={Globe}
                  field="website"
                  placeholder="https://votre-site.com"
                />
                <SocialField
                  label="LinkedIn"
                  value={profile.linkedin || ""}
                  icon={Linkedin}
                  field="linkedin"
                  placeholder="https://linkedin.com/in/votre-profil"
                />
                <SocialField
                  label="GitHub"
                  value={profile.github || ""}
                  icon={Github}
                  field="github"
                  placeholder="https://github.com/votre-compte"
                />
                <SocialField
                  label="Twitter"
                  value={profile.twitter || ""}
                  icon={Twitter}
                  field="twitter"
                  placeholder="https://twitter.com/votre-compte"
                />
              </div>
            </Card>

            {/* Clubs */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">
                {profile.role === 'member' ? 'Clubs' : 'Clubs supervisés'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.clubs.map((club) => (
                  <div key={club.clubId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 text-[#0EA8A8]" />
                    <div>
                      <p className="font-medium text-[#1B2A4A]">{club.clubName}</p>
                      <p className="text-xs text-gray-500">{club.role} depuis {new Date(club.joinDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}