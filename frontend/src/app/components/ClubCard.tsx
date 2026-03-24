import { Club } from "../data/mockData";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users } from "lucide-react";

interface ClubCardProps {
  club: Club;
  onJoin?: () => void;
}

export function ClubCard({ club, onJoin }: ClubCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32">
        <img
          src={club.coverPhoto}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-[#0EA8A8]">{club.category}</Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={club.logo}
            alt={club.name}
            className="w-12 h-12 rounded-lg border-2 border-white shadow"
          />
          <div className="flex-1">
            <h3 className="font-bold text-[#1B2A4A]">{club.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{club.memberCount} membres</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {club.description}
        </p>

        {onJoin && (
          <Button
            onClick={onJoin}
            className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]"
          >
            Rejoindre
          </Button>
        )}
      </div>
    </Card>
  );
}
