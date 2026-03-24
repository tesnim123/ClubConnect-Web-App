import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Clock, Mail, CheckCircle } from "lucide-react";

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#F5A623]/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-[#F5A623]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">
            Demande en cours d'examen
          </h1>
          <p className="text-lg text-gray-600">
            Votre demande pour rejoindre <span className="font-semibold text-[#0EA8A8]">Club Robotique</span> est en cours d'examen
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-md mx-auto mb-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-[#1B2A4A]">Inscription</h3>
                <p className="text-sm text-gray-600">Votre compte a été créé avec succès</p>
              </div>
            </div>

            <div className="flex items-start gap-4 ml-5">
              <div className="w-0.5 h-8 bg-gray-300"></div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center flex-shrink-0 animate-pulse">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-[#1B2A4A]">Examen staff</h3>
                <p className="text-sm text-gray-600">Le staff du club examine votre demande</p>
              </div>
            </div>

            <div className="flex items-start gap-4 ml-5">
              <div className="w-0.5 h-8 bg-gray-300"></div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-gray-400">Accès accordé</h3>
                <p className="text-sm text-gray-400">Vous pourrez accéder à votre club</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Vous serez notifié par email</p>
              <p>Nous vous enverrons un email à <span className="font-semibold">votre.email@university.edu</span> dès que votre demande sera approuvée.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Se connecter</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
