import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../context/AuthContext";
import { apiRequest, ApiClientError } from "../lib/api";
import type { ClubSummary } from "../types/auth";

export default function Signup() {
  const navigate = useNavigate();
  const { registerMember } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    clubId: "",
  });
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const response = await apiRequest<{ items: ClubSummary[] }>("/clubs", {
          method: "GET",
        });
        setClubs(response.items);
      } catch (_error) {
        toast.error("Impossible de charger la liste des clubs");
      }
    };

    void loadClubs();
  }, []);

  const toggleClub = (id: string) => {
    setSelectedClubIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (selectedClubIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un club à rejoindre");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerMember({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        clubId: selectedClubIds[0] || "",
        clubIds: selectedClubIds,
      });
      toast.success("Demande envoyée. En attente de validation.");
      navigate("/pending");
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Inscription impossible";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-[#0EA8A8] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">S'inscrire</h1>
          <p className="text-gray-600 mt-2">Créez votre compte ClubConnect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@clubconnect.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ex: +216 22 123 456"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label className="block text-sm font-semibold text-gray-700">Clubs à rejoindre (sélection multiple)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border rounded-lg bg-white">
              {clubs.map((club) => {
                const isSelected = selectedClubIds.includes(club._id);
                return (
                  <button
                    key={club._id}
                    type="button"
                    onClick={() => toggleClub(club._id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-all duration-200 ${
                      isSelected
                        ? "border-[#0EA8A8] bg-[#0EA8A8]/10 text-[#0c8e8e] font-semibold shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{club.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#0EA8A8] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedClubIds.length === 0 && (
              <p className="mt-1 text-xs text-red-500">Veuillez sélectionner au moins un club.</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p>
              Votre demande sera examinée par le président du club sélectionné.
              Vous pourrez vous connecter après acceptation.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inscription..." : "S'inscrire"}
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-[#0EA8A8] hover:underline font-semibold"
            >
              Se connecter
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
