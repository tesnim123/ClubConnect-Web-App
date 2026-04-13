// components/EventCard.tsx
import { Event } from "../data/mockData";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  onRSVP?: () => void;
  onClick?: () => void; // Ajouter onClick comme prop optionnelle
}

export function EventCard({ event, onRSVP, onClick }: EventCardProps) {
  const statusColors = {
    open: "bg-green-500",
    full: "bg-red-500",
    pending: "bg-yellow-500",
    approved: "bg-blue-500",
    rejected: "bg-gray-500",
  };

  const statusLabels = {
    open: "Ouvert",
    full: "Complet",
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Refusé",
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRSVP) {
      onRSVP();
    }
  };

  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative h-48">
        <img
          src={event.coverPhoto}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Event";
          }}
        />
        <Badge className={`absolute top-3 right-3 ${statusColors[event.status]}`}>
          {statusLabels[event.status]}
        </Badge>
        {event.type === 'inter-club' && (
          <Badge className="absolute top-3 left-3 bg-[#F5A623]">
            Inter-clubs
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={event.clubLogo}
            alt={event.clubName}
            className="w-8 h-8 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/32?text=Club";
            }}
          />
          <span className="text-sm text-gray-600">{event.clubName}</span>
        </div>

        <h3 className="font-bold text-lg text-[#1B2A4A] mb-3 line-clamp-2">{event.title}</h3>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.date), 'PPP', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{event.time} • {event.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{event.participantCount} / {event.maxCapacity} participants</span>
          </div>
        </div>

        {onRSVP && (
          <Button
            onClick={handleButtonClick}
            className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]"
            disabled={event.status === 'full'}
          >
            {event.status === 'full' ? 'Complet' : 'Participer'}
          </Button>
        )}
      </div>
    </Card>
  );
}