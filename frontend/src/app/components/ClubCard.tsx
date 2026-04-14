import type { AdminClub } from "../types/club";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users } from "lucide-react";
import { useNavigate } from "react-router";

interface ClubCardProps {
  club: AdminClub;
  onJoin?: () => void;
}

export function ClubCard({ club, onJoin }: ClubCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/admin/clubs/${club._id}`);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from triggering
    if (onJoin) {
      onJoin();
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-32">
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#10233F_0%,#0EA8A8_100%)]">
          <span className="text-5xl font-bold text-white">{club.name.charAt(0)}</span>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-[#0EA8A8]">FST</Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-white text-lg font-bold text-[#10233F] shadow">
            {club.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1B2A4A]">{club.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{club.members.length} membres</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {club.description}
        </p>

        <p className="text-xs text-gray-500 mb-4">{club.staff.length} postes staff actifs</p>

        {onJoin && (
          <Button
            onClick={handleJoinClick}
            className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]"
          >
            Rejoindre
          </Button>
        )}
      </div>
    </Card>
  );
}
