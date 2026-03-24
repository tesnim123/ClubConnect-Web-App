import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { events } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Check, X, Calendar, MapPin } from "lucide-react";

export default function AdminEventRequests() {
  const pendingEvents = events.filter(e => e.status === 'pending');
  const approvedEvents = events.filter(e => e.status === 'approved');

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav userName="Admin" notificationCount={7} />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Demandes d'événements</h1>
            <p className="text-gray-600">Approuver ou refuser les demandes d'événements</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                En attente <Badge className="ml-2 bg-[#F5A623]">{pendingEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">Approuvés</TabsTrigger>
              <TabsTrigger value="rejected">Refusés</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">Aucune demande en attente</p>
                </Card>
              ) : (
                pendingEvents.map((event) => (
                  <Card key={event.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <img
                          src={event.clubLogo}
                          alt={event.clubName}
                          className="w-16 h-16 rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-[#1B2A4A]">{event.title}</h3>
                            <Badge variant="secondary">{event.clubName}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date} à {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{event.room || event.location}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-1">Équipement demandé:</p>
                            <div className="flex flex-wrap gap-2">
                              {event.equipment.map((item, idx) => (
                                <Badge key={idx} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button className="bg-green-500 hover:bg-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button variant="destructive">
                          <X className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved">
              <Card className="p-12 text-center">
                <p className="text-gray-500">Liste des événements approuvés</p>
              </Card>
            </TabsContent>

            <TabsContent value="rejected">
              <Card className="p-12 text-center">
                <p className="text-gray-500">Liste des événements refusés</p>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
