import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4">
      <Card className="p-12 text-center max-w-md">
        <h1 className="text-6xl font-bold text-[#1B2A4A] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">Page non trouvée</h2>
        <p className="text-gray-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </Card>
    </div>
  );
}
