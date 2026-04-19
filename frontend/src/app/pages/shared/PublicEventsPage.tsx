import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { Card } from "../../components/ui/card";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { getRoleSection } from "../../lib/role";
import type { ClubPost } from "../../types/club";

export default function PublicEventsPage() {
  const { user } = useAuth();
  const section = getRoleSection(user?.role);
  const [events, setEvents] = useState<ClubPost[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await apiRequest<{ items: ClubPost[] }>("/posts/public/events");
      setEvents(response.items);
    };

    void load();
  }, []);

  return (
    <AppShell
      title="Evenements publics"
      description="Tous les evenements publies et visibles sans restriction."
      sectionOverride={section}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {events.map((event) => (
          <Card key={event._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 text-[#0EA8A8]">
              <CalendarDays className="h-5 w-5" />
              <span className="text-sm font-semibold">{event.club.name}</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-[#10233F]">{event.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{new Date(event.publishedAt || event.createdAt).toLocaleString("fr-FR")}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">{event.content}</p>
          </Card>
        ))}

        {events.length === 0 ? (
          <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Aucun evenement public pour le moment.
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
