import { Link } from "react-router";
import { Calendar, MapPin, PlusCircle, Users, Wrench } from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { events, members } from "../../data/mockData";

export default function EventRequestsList() {
  const staffUser = members.find((member) => member.role === "president") ?? members[0];
  const sidebarRole = staffUser.role === "president" ? "president" : "staff";
  const clubEvents = events.filter((event) => event.clubId === staffUser.clubId);
  const workshops = clubEvents.filter((event) => event.format === "workshop");
  const classicEvents = clubEvents.filter((event) => event.format !== "workshop");

  return (
    <div className="flex h-screen">
      <Sidebar role={sidebarRole} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userId={staffUser.id}
          userName={`${staffUser.firstName} ${staffUser.lastName}`}
          userAvatar={staffUser.avatar}
          userRole="President"
          userRoleType="staff"
          notificationCount={clubEvents.length}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Evenements et workshops</h1>
              <p className="text-gray-600">
                Le president voit tous les rendez-vous du club et peut en ajouter de nouveaux.
              </p>
            </div>

            <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
              <Link to="/staff/event/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                Ajouter un evenement
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <Card className="p-5">
              <p className="text-sm text-gray-500">Total club</p>
              <p className="text-3xl font-bold text-[#1B2A4A]">{clubEvents.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-gray-500">Evenements</p>
              <p className="text-3xl font-bold text-[#1B2A4A]">{classicEvents.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-gray-500">Workshops</p>
              <p className="text-3xl font-bold text-[#1B2A4A]">{workshops.length}</p>
            </Card>
          </div>

          <div className="space-y-4">
            {clubEvents.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={event.format === "workshop" ? "bg-[#F5A623]" : "bg-[#0EA8A8]"}>
                        {event.format === "workshop" ? "Workshop" : "Evenement"}
                      </Badge>
                      <Badge variant="outline">{event.type}</Badge>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>

                    <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">{event.title}</h2>
                    <p className="text-gray-600 mb-4">{event.description}</p>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0EA8A8]" />
                        <span>
                          {event.date} a {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#0EA8A8]" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0EA8A8]" />
                        <span>
                          {event.participantCount}/{event.maxCapacity} participants
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-[220px] rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 mb-1">Organisation</p>
                    <p className="font-semibold text-[#1B2A4A] mb-3">{event.organizer}</p>
                    <p className="text-sm text-gray-500 mb-1">Materiel prevu</p>
                    <div className="flex flex-wrap gap-2">
                      {event.equipment.slice(0, 3).map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                      {event.equipment.length > 3 && <Badge variant="outline">+{event.equipment.length - 3}</Badge>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {clubEvents.length === 0 && (
            <Card className="p-10 mt-6 text-center">
              <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Aucun evenement trouve pour ce club.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
