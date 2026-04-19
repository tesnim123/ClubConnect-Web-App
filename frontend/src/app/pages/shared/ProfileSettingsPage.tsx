import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { getRoleSection } from "../../lib/role";

export default function ProfileSettingsPage() {
  const { user, changePassword } = useAuth();
  const section = getRoleSection(user?.role);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Mot de passe mis a jour.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mise a jour impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Profil et securite"
      description="Consultez vos informations et mettez a jour votre mot de passe."
      sectionOverride={section}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-bold text-[#10233F]">Profil</h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="font-semibold text-[#10233F]">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-[#10233F]">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold text-[#10233F]">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <p className="font-semibold text-[#10233F]">{user?.status}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-bold text-[#10233F]">Changer le mot de passe</h2>
          <div className="mt-5 space-y-4">
            <Input
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
              <KeyRound className="mr-2 h-4 w-4" />
              {isSubmitting ? "Mise a jour..." : "Mettre a jour"}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
