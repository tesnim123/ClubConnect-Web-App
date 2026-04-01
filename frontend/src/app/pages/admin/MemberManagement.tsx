// pages/admin/MemberManagement.tsx (version modifiée - admin ne gère que les staffs)
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Building,
  Shield,
  UserPlus,
  ChevronRight,
  Grid3x3,
  List,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";

interface Member {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'president' | 'vice_president' | 'secretary' | 'treasurer' | 'staff' | 'member';
  roleLabel: string;
  clubName: string;
  clubId: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

// Données d'exemple
const mockMembers: Member[] = [
  {
    id: "1",
    fullName: "Jean Dupont",
    email: "jean.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    role: "president",
    roleLabel: "Président",
    clubName: "Club d'Informatique",
    clubId: "club1",
    joinDate: "2024-01-15",
    status: "active"
  },
  {
    id: "2",
    fullName: "Marie Martin",
    email: "marie.martin@example.com",
    phone: "+33 6 98 76 54 32",
    role: "vice_president",
    roleLabel: "Vice-président",
    clubName: "Club d'Informatique",
    clubId: "club1",
    joinDate: "2024-01-20",
    status: "active"
  },
  {
    id: "3",
    fullName: "Pierre Durand",
    email: "pierre.durand@example.com",
    role: "staff",
    roleLabel: "Staff",
    clubName: "Club Sportif",
    clubId: "club2",
    joinDate: "2024-02-01",
    status: "active"
  },
  {
    id: "4",
    fullName: "Sophie Bernard",
    email: "sophie.bernard@example.com",
    phone: "+33 6 23 45 67 89",
    role: "member",
    roleLabel: "Membre",
    clubName: "Club Artistique",
    clubId: "club3",
    joinDate: "2024-02-15",
    status: "active"
  },
  {
    id: "5",
    fullName: "Lucas Moreau",
    email: "lucas.moreau@example.com",
    role: "member",
    roleLabel: "Membre",
    clubName: "Club d'Informatique",
    clubId: "club1",
    joinDate: "2024-03-01",
    status: "pending"
  },
  {
    id: "6",
    fullName: "Emma Richard",
    email: "emma.richard@example.com",
    phone: "+33 6 56 78 90 12",
    role: "treasurer",
    roleLabel: "Trésorier",
    clubName: "BDE",
    clubId: "club5",
    joinDate: "2024-01-10",
    status: "active"
  },
  {
    id: "7",
    fullName: "Thomas Petit",
    email: "thomas.petit@example.com",
    role: "staff",
    roleLabel: "Staff",
    clubName: "Club Artistique",
    clubId: "club3",
    joinDate: "2024-02-20",
    status: "inactive"
  },
  {
    id: "8",
    fullName: "Claire Lefevre",
    email: "claire.lefevre@example.com",
    role: "secretary",
    roleLabel: "Secrétaire",
    clubName: "Club Sportif",
    clubId: "club2",
    joinDate: "2024-01-25",
    status: "active"
  },
  {
    id: "9",
    fullName: "Antoine Dubois",
    email: "antoine.dubois@example.com",
    role: "member",
    roleLabel: "Membre",
    clubName: "Club Sportif",
    clubId: "club2",
    joinDate: "2024-03-10",
    status: "active"
  },
  {
    id: "10",
    fullName: "Julie Leroy",
    email: "julie.leroy@example.com",
    role: "member",
    roleLabel: "Membre",
    clubName: "Club Artistique",
    clubId: "club3",
    joinDate: "2024-03-15",
    status: "active"
  }
];

// Liste des clubs avec leurs couleurs
const clubs = [
  { id: "club1", name: "Club d'Informatique", color: "from-[#0EA8A8] to-[#1B2A4A]" },
  { id: "club2", name: "Club Sportif", color: "from-blue-500 to-blue-700" },
  { id: "club3", name: "Club Artistique", color: "from-purple-500 to-purple-700" },
  { id: "club4", name: "Club Écologie", color: "from-green-500 to-green-700" },
  { id: "club5", name: "BDE", color: "from-orange-500 to-orange-700" }
];

const roleOptions = [
  { value: "president", label: "Président", color: "bg-purple-100 text-purple-800", icon: Shield },
  { value: "vice_president", label: "Vice-président", color: "bg-indigo-100 text-indigo-800", icon: Shield },
  { value: "secretary", label: "Secrétaire", color: "bg-blue-100 text-blue-800", icon: User },
  { value: "treasurer", label: "Trésorier", color: "bg-green-100 text-green-800", icon: User },
  { value: "staff", label: "Staff", color: "bg-orange-100 text-orange-800", icon: Shield }
  // Note: Le rôle "member" a été retiré car l'admin ne peut pas gérer les membres simples
];

// Rôles staff (ceux que l'admin peut gérer)
const staffRoles = ['president', 'vice_president', 'secretary', 'treasurer', 'staff'];

export default function AdminMemberManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClub, setFilterClub] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grouped');
  const [collapsedClubs, setCollapsedClubs] = useState<Set<string>>(new Set());
  const [members, setMembers] = useState<Member[]>(mockMembers);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "staff",
    clubId: "",
    status: "active"
  });

  // Filtrer pour n'afficher que les membres du staff (pas les membres simples)
  const staffOnlyMembers = members.filter(member => staffRoles.includes(member.role));

  // Get unique clubs for filter (uniquement des clubs qui ont des staffs)
  const uniqueClubs = [...new Set(staffOnlyMembers.map(m => m.clubName))];

  // Filter staff members
  const filterStaffMembers = (membersList: Member[]) => {
    return membersList.filter(member => {
      const matchesSearch = searchQuery === "" || 
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.clubName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClub = filterClub === "all" || member.clubName === filterClub;
      const matchesRole = filterRole === "all" || member.role === filterRole;
      const matchesStatus = filterStatus === "all" || member.status === filterStatus;
      
      return matchesSearch && matchesClub && matchesRole && matchesStatus;
    });
  };

  const filteredMembers = filterStaffMembers(staffOnlyMembers);
  
  // Group members by club
  const groupMembersByClub = () => {
    const groups: { [key: string]: Member[] } = {};
    filteredMembers.forEach(member => {
      if (!groups[member.clubName]) {
        groups[member.clubName] = [];
      }
      groups[member.clubName].push(member);
    });
    // Sort clubs alphabetically
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  };

  const membersByClub = groupMembersByClub();
  
  const staffMembers = filteredMembers; // Tous sont des staffs
  const simpleMembers = []; // Aucun membre simple visible

  const toggleClubCollapse = (clubName: string) => {
    const newCollapsed = new Set(collapsedClubs);
    if (newCollapsed.has(clubName)) {
      newCollapsed.delete(clubName);
    } else {
      newCollapsed.add(clubName);
    }
    setCollapsedClubs(newCollapsed);
  };

  const getRoleBadge = (role: string, roleLabel: string) => {
    const roleConfig = roleOptions.find(r => r.value === role);
    const Icon = roleConfig?.icon;
    return (
      <Badge className={`${roleConfig?.color} font-medium flex items-center gap-1`}>
        {Icon && <Icon className="w-3 h-3" />}
        {roleLabel}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Actif" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactif" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "En attente" }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getClubColor = (clubName: string) => {
    const club = clubs.find(c => c.name === clubName);
    return club?.color || "from-gray-500 to-gray-700";
  };

  const handleAddMember = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "staff",
      clubId: "",
      status: "active"
    });
    setIsAddModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    // Vérifier que le membre est bien un staff (pas un membre simple)
    if (!staffRoles.includes(member.role)) {
      toast.error("Vous ne pouvez pas modifier un membre simple");
      return;
    }
    setSelectedMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      clubId: member.clubId,
      status: member.status
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteMember = (member: Member) => {
    // Vérifier que le membre est bien un staff (pas un membre simple)
    if (!staffRoles.includes(member.role)) {
      toast.error("Vous ne pouvez pas supprimer un membre simple");
      return;
    }
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const saveMember = async () => {
    if (!formData.fullName || !formData.email || !formData.clubId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Vérifier que le rôle n'est pas "member"
    

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const club = clubs.find(c => c.id === formData.clubId);
      const roleOption = roleOptions.find(r => r.value === formData.role);
      
      if (isEditModalOpen && selectedMember) {
        // Vérifier que le membre modifié reste un staff
        if (formData.role === "member") {
          toast.error("Vous ne pouvez pas transformer un staff en membre simple");
          return;
        }
        // Update existing member
        setMembers(members.map(m => 
          m.id === selectedMember.id 
            ? {
                ...m,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role as any,
                roleLabel: roleOption?.label || "Staff",
                clubId: formData.clubId,
                clubName: club?.name || "",
                status: formData.status as any
              }
            : m
        ));
        toast.success("Membre modifié avec succès");
        setIsEditModalOpen(false);
      } else {
        // Add new staff member
        const newMember: Member = {
          id: Date.now().toString(),
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role as any,
          roleLabel: roleOption?.label || "Staff",
          clubId: formData.clubId,
          clubName: club?.name || "",
          joinDate: new Date().toISOString().split('T')[0],
          status: formData.status as any
        };
        setMembers([...members, newMember]);
        toast.success("Membre staff ajouté avec succès");
        setIsAddModalOpen(false);
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const confirmDelete = async () => {
    if (selectedMember) {
      // Vérification supplémentaire avant suppression
      if (!staffRoles.includes(selectedMember.role)) {
        toast.error("Vous ne pouvez pas supprimer un membre simple");
        setIsDeleteModalOpen(false);
        return;
      }
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setMembers(members.filter(m => m.id !== selectedMember.id));
        toast.success("Membre supprimé avec succès");
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const MemberCard = ({ member }: { member: Member }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EA8A8] to-[#1B2A4A] flex items-center justify-center text-white font-bold text-lg">
            {member.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-[#1B2A4A]">{member.fullName}</h3>
              {getRoleBadge(member.role, member.roleLabel)}
              {getStatusBadge(member.status)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Mail className="w-3 h-3" />
              <span className="truncate">{member.email}</span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Phone className="w-3 h-3" />
                <span>{member.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
              <User className="w-3 h-3" />
              <span>Membre depuis le {new Date(member.joinDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditMember(member)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteMember(member)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const GroupedView = () => (
    <div className="space-y-6">
      {Object.entries(membersByClub).map(([clubName, clubMembers]) => {
        const isCollapsed = collapsedClubs.has(clubName);
        const clubColor = getClubColor(clubName);
        
        // Compter les membres par rôle (tous sont des staffs ici)
        const staffCount = clubMembers.length;
        
        return (
          <Card key={clubName} className="overflow-hidden border-0 shadow-md">
            {/* En-tête du club avec nom clairement affiché */}
            <div 
              className={`bg-gradient-to-r ${clubColor} p-5 cursor-pointer hover:opacity-95 transition-all duration-200`}
              onClick={() => toggleClubCollapse(clubName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Icône du club */}
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Informations du club */}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{clubName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-white/90 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {staffCount} staff{staffCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Bouton pour développer/réduire */}
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  size="sm"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Liste des membres staff */}
            {!isCollapsed && (
              <div className="p-4 bg-gray-50">
                {clubMembers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun staff dans ce club</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clubMembers.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
      
      {Object.keys(membersByClub).length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun membre du staff trouvé dans les clubs</p>
        </Card>
      )}
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMembers.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId="1"
          userName="Admin User"
          userRole="Administrateur"
          userRoleType="admin"
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Gestion des staffs</h1>
                <p className="text-gray-600">Gérer les membres du staff de tous les clubs (présidents, vice-présidents, secrétaires, trésoriers, staff)</p>
              </div>
              <div className="flex gap-2">
                <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                  <Button
                    variant={viewMode === 'grouped' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grouped')}
                    className={viewMode === 'grouped' ? 'bg-[#0EA8A8]' : ''}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Par club
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-[#0EA8A8]' : ''}
                  >
                    <Grid3x3 className="w-4 h-4 mr-1" />
                    Grille
                  </Button>
                </div>
                <Button 
                  onClick={handleAddMember}
                  className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un staff
                </Button>
              </div>
            </div>

           
            

            {/* Search and Filters */}
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou club..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {showFilters && (
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Club
                      </label>
                      <select
                        value={filterClub}
                        onChange={(e) => setFilterClub(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                      >
                        <option value="all">Tous les clubs</option>
                        {uniqueClubs.map(club => (
                          <option key={club} value={club}>{club}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle
                      </label>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                      >
                        <option value="all">Tous les rôles</option>
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="pending">En attente</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setFilterClub("all");
                        setFilterRole("all");
                        setFilterStatus("all");
                        setSearchQuery("");
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white">
              <TabsTrigger value="all">
                <Shield className="w-4 h-4 mr-2" />
                Tous les staffs ({filteredMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredMembers.length === 0 ? (
                <Card className="p-12 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun membre du staff trouvé</p>
                  <Button 
                    variant="link" 
                    onClick={handleAddMember}
                    className="mt-2 text-[#0EA8A8]"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter un staff
                  </Button>
                </Card>
              ) : (
                viewMode === 'grouped' ? <GroupedView /> : <GridView />
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Add/Edit Member Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={() => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditModalOpen ? "Modifier le staff" : "Ajouter un staff"}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? "Modifiez les informations du membre du staff" : "Remplissez les informations pour ajouter un nouveau membre du staff"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jean@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.clubId}
                onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
              >
                <option value="">Sélectionner un club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
              >
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Note: L'administrateur ne peut pas créer de membres simples.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
            }}>
              Annuler
            </Button>
            <Button onClick={saveMember} className="bg-[#0EA8A8]">
              {isEditModalOpen ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedMember?.fullName} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}