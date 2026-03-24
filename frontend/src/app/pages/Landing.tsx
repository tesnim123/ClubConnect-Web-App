import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Users, Calendar, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F8FC] to-white">
      {/* Hero Section */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0EA8A8] flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#1B2A4A]">ClubConnect</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
            <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
              <Link to="/signup">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#1B2A4A] mb-4">
            ClubConnect
          </h1>
          <p className="text-2xl text-[#0EA8A8] mb-8">
            Connectez. Créez. Collaborez.
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            La plateforme complète pour gérer vos clubs universitaires, organiser des événements
            et collaborer avec vos membres en temps réel.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
              <Link to="/signup">Commencer maintenant</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-[#0EA8A8]/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#0EA8A8]" />
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">
              Gérez vos clubs
            </h3>
            <p className="text-gray-600">
              Administrez facilement les membres, les rôles et les permissions de votre club.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-[#0EA8A8]/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-[#0EA8A8]" />
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">
              Organisez vos événements
            </h3>
            <p className="text-gray-600">
              Créez et gérez des événements intra-club ou inter-clubs avec gestion des inscriptions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-[#0EA8A8]/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-[#0EA8A8]" />
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">
              Communiquez en temps réel
            </h3>
            <p className="text-gray-600">
              Canaux de discussion dédiés et forums pour chaque club et inter-clubs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-gray-200">
          <p className="text-gray-600">
            © 2026 ClubConnect - Université
          </p>
        </div>
      </div>
    </div>
  );
}
