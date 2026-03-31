// pages/admin/CreateClub.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Upload, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function CreateClub() {
  const navigate = useNavigate();
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: "1", email: "", fullName: "", role: "President" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addStaffMember = () => {
    setStaffMembers([
      ...staffMembers,
      { id: Date.now().toString(), email: "", fullName: "", role: "Member" }
    ]);
  };

  const removeStaffMember = (id: string) => {
    if (staffMembers.length > 1) {
      setStaffMembers(staffMembers.filter(member => member.id !== id));
    }
  };

  const updateStaffMember = (id: string, field: keyof StaffMember, value: string) => {
    setStaffMembers(staffMembers.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!clubName.trim()) {
      setError("Le nom du club est requis");
      return;
    }
    
    if (!description.trim()) {
      setError("La description est requise");
      return;
    }
    
    const invalidStaff = staffMembers.some(member => 
      !member.email.trim() || !member.fullName.trim() || !member.role.trim()
    );
    
    if (invalidStaff) {
      setError("Tous les champs des membres du staff sont requis");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", clubName);
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
      }
      formData.append("staffMembers", JSON.stringify(staffMembers));

      // Ici, vous ferez l'appel API pour créer le club
      // Exemple: await api.post('/clubs', formData)
      console.log("Création du club:", Object.fromEntries(formData));
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Club créé avec succès !", {
        description: "Les membres du staff ont reçu leurs identifiants par email.",
      });
      
      // Rediriger vers la page de gestion des clubs
      navigate("/admin/clubs");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      toast.error("Erreur", {
        description: err.message || "Une erreur est survenue lors de la création du club",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
  userId="admin_1"
  userName="Admin User"
  userRole="Administrateur"
  userRoleType="admin"
  notificationCount={5}
/>

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/clubs")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la gestion des clubs</span>
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Créer un nouveau club</h1>
              <p className="text-gray-600">Remplissez les informations ci-dessous pour créer un nouveau club universitaire</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du club <span className="text-red-500">*</span>
                </label>
                <Input
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="Entrez le nom du club"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez le club, ses objectifs et activités"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image du club
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview("");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#0EA8A8] transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Membres du staff <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStaffMember}
                    className="text-[#0EA8A8] border-[#0EA8A8] hover:bg-[#0EA8A8] hover:text-white"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Ajouter un membre
                  </Button>
                </div>

                <div className="space-y-3">
                  {staffMembers.map((member) => (
                    <div key={member.id} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                      {staffMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStaffMember(member.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nom complet
                          </label>
                          <Input
                            value={member.fullName}
                            onChange={(e) => updateStaffMember(member.id, "fullName", e.target.value)}
                            placeholder="Jean Dupont"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Email
                          </label>
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateStaffMember(member.id, "email", e.target.value)}
                            placeholder="jean@example.com"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Rôle
                          </label>
                          <select
                            value={member.role}
                            onChange={(e) => updateStaffMember(member.id, "role", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] focus:border-transparent bg-white"
                          >
                            <option value="President">Président</option>
                            <option value="Vice President">Vice-président</option>
                            <option value="Secretary">Secrétaire</option>
                            <option value="Treasurer">Trésorier</option>
                            
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/admin/clubs")}
                  className="px-4"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-[#0EA8A8] hover:bg-[#0c8e8e] px-6"
                >
                  {isLoading ? "Création en cours..." : "Créer le club"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}