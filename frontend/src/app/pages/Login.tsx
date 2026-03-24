import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - redirect to member dashboard
    navigate("/member/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-[#0EA8A8] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Se connecter</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte ClubConnect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email universitaire</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre.nom@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-[#0EA8A8] hover:underline">
              Mot de passe oublié?
            </Link>
          </div>

          <Button type="submit" className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]">
            Se connecter
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" type="button">
            Connexion avec compte universitaire
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Pas encore de compte?{" "}
            <Link to="/signup" className="text-[#0EA8A8] hover:underline font-semibold">
              S'inscrire
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
