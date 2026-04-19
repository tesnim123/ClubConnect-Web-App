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
    password: "",
    confirmPassword: "",
    clubId: "",
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerMember({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        clubId: formData.clubId,
      });
      toast.success("Demande envoyée. En attente de validation.");
      navigate("/pending");
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Inscription impossible";
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
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@clubconnect.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="club">Club à rejoindre</Label>
            <Select
              value={formData.clubId}
              onValueChange={(value) => setFormData({ ...formData, clubId: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionnez un club" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club._id} value={club._id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p>
              Votre demande sera examinée par le président du club sélectionné. Vous pourrez vous
              connecter après acceptation.
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
            <Link to="/login" className="text-[#0EA8A8] hover:underline font-semibold">
              Se connecter
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}