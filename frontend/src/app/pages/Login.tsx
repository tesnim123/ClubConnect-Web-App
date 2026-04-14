import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { getRoleHomePath } from "../lib/auth";
import { ApiClientError } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      toast.success("Connexion reussie");
      const redirectTo = location.state?.from?.pathname || getRoleHomePath(user.role);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Connexion impossible";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,168,168,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(27,42,74,0.14),_transparent_28%),linear-gradient(160deg,_#f3f7fb_0%,_#eef6f3_48%,_#f8fafc_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-[#1B2A4A] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#0EA8A8]" />
              Espace clubs, evenements et animation jeunesse
            </div>
            <h1 className="text-5xl font-bold leading-tight text-[#10233F]">
              Pilotez vos clubs jeunes depuis une interface plus claire.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              ClubConnect centralise les clubs, les demandes d'evenements, les communications et les profils d'equipe dans un espace moderne et rapide.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Acces securise", text: "Connexion admin et roles relies au vrai compte." },
                { icon: LockKeyhole, title: "Session fiable", text: "Navigation, profil et deconnexion synchronises." },
                { icon: Sparkles, title: "Experience moderne", text: "Design plus adapte aux clubs et aux jeunes." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0EA8A8]/12 text-[#0EA8A8]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-[#10233F]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-lg rounded-[2rem] border-white/70 bg-white/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#10233F_0%,#0EA8A8_100%)] shadow-lg">
              <span className="text-3xl font-bold text-white">C</span>
            </div>
            <h1 className="text-3xl font-bold text-[#10233F]">Connexion</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Accedez a votre espace administrateur, president, staff ou membre.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clubconnect.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50/80"
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50/80"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#10233F_0%,#0EA8A8_100%)] text-white hover:opacity-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="rounded-2xl border border-[#0EA8A8]/15 bg-[#0EA8A8]/5 p-4 text-sm text-slate-600">
              L'acces administrateur utilise maintenant la meme session fiable que le reste de l'application.
            </div>

            <p className="text-center text-sm text-gray-600">
              Pas encore de compte ?{" "}
              <Link to="/signup" className="font-semibold text-[#0EA8A8] hover:underline">
                S'inscrire
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
