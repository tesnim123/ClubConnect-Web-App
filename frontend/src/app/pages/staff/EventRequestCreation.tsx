import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { members } from "../../data/mockData";

export default function EventRequestCreation() {
  const staffUser = members.find((member) => member.role === "president") ?? members[0];
  const sidebarRole = staffUser.role === "president" ? "president" : "staff";
  const [form, setForm] = useState({
    title: "",
    description: "",
    format: "event",
    type: "intra-club",
    date: "",
    time: "",
    location: "",
    capacity: "",
    equipment: "",
  });

  const handleSubmit = () => {
    if (!form.title || !form.date || !form.time || !form.location) {
      toast.error("Veuillez remplir les champs principaux.");
      return;
    }

    toast.success(`${form.format === "workshop" ? "Workshop" : "Evenement"} ajoute avec succes.`);
    setForm({
      title: "",
      description: "",
      format: "event",
      type: "intra-club",
      date: "",
      time: "",
      location: "",
      capacity: "",
      equipment: "",
    });
  };

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
          notificationCount={2}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-[#1B2A4A]">Creation president</Badge>
              <Badge variant="outline">{staffUser.clubName}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Ajouter un evenement</h1>
            <p className="text-gray-600">
              Creez un evenement ou un workshop avec les informations essentielles du club.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1B2A4A]">Titre</label>
                  <Input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Ex: Workshop capteurs intelligents"
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A]">Format</label>
                  <Select value={form.format} onValueChange={(value) => setForm((prev) => ({ ...prev, format: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Evenement</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A]">Portee</label>
                  <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intra-club">Intra-club</SelectItem>
                      <SelectItem value="inter-club">Inter-club</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A]">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A]">Heure</label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1B2A4A]">Lieu</label>
                  <Input
                    value={form.location}
                    onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                    placeholder="Salle, labo ou amphitheatre"
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A]">Capacite</label>
                  <Input
                    type="number"
                    value={form.capacity}
                    onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                    placeholder="40"
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A]">Materiel</label>
                  <Input
                    value={form.equipment}
                    onChange={(event) => setForm((prev) => ({ ...prev, equipment: event.target.value }))}
                    placeholder="Projecteur, Arduino, micro..."
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1B2A4A]">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Objectif, public cible, deroulement..."
                    className="mt-2 min-h-32"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" onClick={handleSubmit}>
                  Publier
                </Button>
              </div>
            </Card>

            <Card className="p-6 h-fit">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Bon cadrage</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="font-semibold text-[#1B2A4A] mb-1">Si c&apos;est un workshop</p>
                  <p>Precisez les prerequis, le materiel et le nombre de places disponibles.</p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="font-semibold text-[#1B2A4A] mb-1">Si c&apos;est inter-club</p>
                  <p>Choisissez un lieu clair, une capacite adaptee et une communication plus large.</p>
                </div>
                <div className="rounded-xl bg-[#1B2A4A] text-white p-4">
                  <p className="font-semibold mb-1">Droit president</p>
                  <p className="text-white/80">
                    Cette page permet d&apos;ajouter directement les activites du club sans passer par un administrateur.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
