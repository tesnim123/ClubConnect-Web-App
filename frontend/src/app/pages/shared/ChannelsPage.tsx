import { useEffect, useState } from "react";
import { Hash, Lock, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { getRoleSection } from "../../lib/role";
import { disconnectSocket, getSocket } from "../../lib/socket";
import type { AdminClub, Channel, ChannelMessage } from "../../types/club";

export default function ChannelsPage() {
  const { user, token } = useAuth();
  const section = getRoleSection(user?.role);
  const canCreateCustomChannel = user?.role === "PRESIDENT";
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [message, setMessage] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [availableClubMembers, setAvailableClubMembers] = useState<AdminClub["members"]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const selectedChannel = channels.find((channel) => channel._id === selectedChannelId);

  const loadChannels = async () => {
    if (!token) {
      return;
    }

    const response = await apiRequest<{ items: Channel[] }>("/channels/my", { token });
    setChannels(response.items);
    if (!selectedChannelId && response.items[0]) {
      setSelectedChannelId(response.items[0]._id);
    }
  };

  const loadClubMembers = async () => {
    if (!token || !user?.club || !canCreateCustomChannel) {
      return;
    }

    const clubId = typeof user.club === "object" ? user.club._id : user.club;
    const response = await apiRequest<{ club: AdminClub }>(`/clubs/${clubId}`, { token });
    setAvailableClubMembers(response.club.members);
  };

  const loadMessages = async (channelId: string) => {
    if (!token || !channelId) {
      return;
    }

    const response = await apiRequest<{ items: ChannelMessage[] }>(`/channels/${channelId}/messages`, { token });
    setMessages(response.items);
  };

  useEffect(() => {
    void loadChannels();
    void loadClubMembers();
    return () => disconnectSocket();
  }, [token]);

  useEffect(() => {
    if (selectedChannelId) {
      void loadMessages(selectedChannelId);
    }
  }, [selectedChannelId, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getSocket(token);

    const handleNewMessage = (payload: ChannelMessage) => {
      const channelValue = typeof payload.channel === "string" ? payload.channel : payload.channel._id;
      if (channelValue === selectedChannelId) {
        setMessages((prev) => [...prev, payload]);
      }
    };

    const handleSync = async () => {
      await loadChannels();
    };

    socket.on("channel:message:new", handleNewMessage);
    socket.on("channels:sync", handleSync);

    return () => {
      socket.off("channel:message:new", handleNewMessage);
      socket.off("channels:sync", handleSync);
    };
  }, [selectedChannelId, token]);

  const sendMessage = async () => {
    if (!token || !selectedChannelId || !message.trim()) {
      return;
    }

    const socket = getSocket(token);
    socket.emit("channel:message", { channelId: selectedChannelId, content: message }, (response: { error?: string }) => {
      if (response?.error) {
        toast.error(response.error);
      } else {
        setMessage("");
      }
    });
  };

  const createChannel = async () => {
    if (!token || !canCreateCustomChannel || !newChannelName.trim()) {
      return;
    }

    await apiRequest("/president/channels", {
      method: "POST",
      token,
      body: JSON.stringify({
        name: newChannelName,
        description: newChannelDescription,
        memberIds: selectedMemberIds,
      }),
    });

    toast.success("Canal cree.");
    setNewChannelName("");
    setNewChannelDescription("");
    setSelectedMemberIds([]);
    await loadChannels();
  };

  return (
    <AppShell
      title="Canaux"
      description="Messagerie temps reel liee aux channels du backend."
      sectionOverride={section}
    >
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="rounded-[1.5rem] border-0 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="mb-4 text-lg font-bold text-[#10233F]">Vos channels</h2>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => setSelectedChannelId(channel._id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                  selectedChannelId === channel._id ? "bg-[#0EA8A8]/10 text-[#0EA8A8]" : "hover:bg-slate-50"
                }`}
              >
                {channel.isSystem ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                <div>
                  <p className="font-semibold">{channel.name}</p>
                  <p className="text-xs text-gray-500">{channel.type}</p>
                </div>
              </button>
            ))}
          </div>

          {canCreateCustomChannel ? (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-[#10233F]">Creer un canal personnalise</h3>
              <div className="space-y-3">
                <Input placeholder="Nom du canal" value={newChannelName} onChange={(event) => setNewChannelName(event.target.value)} />
                <Textarea
                  placeholder="Description"
                  value={newChannelDescription}
                  onChange={(event) => setNewChannelDescription(event.target.value)}
                  className="min-h-24"
                />
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-3">
                  {availableClubMembers.map((member) => (
                    <label key={member._id} className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(member._id)}
                        onChange={(event) =>
                          setSelectedMemberIds((prev) =>
                            event.target.checked
                              ? [...prev, member._id]
                              : prev.filter((item) => item !== member._id)
                          )
                        }
                      />
                      <span>{member.name}</span>
                    </label>
                  ))}

                  {availableClubMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun membre disponible.</p>
                  ) : null}
                </div>
                <Button onClick={createChannel} className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                  <Plus className="mr-2 h-4 w-4" />
                  Creer
                </Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="flex min-h-[560px] flex-col rounded-[1.5rem] border-0 bg-white p-0 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-xl font-bold text-[#10233F]">{selectedChannel?.name ?? "Selectionnez un channel"}</h2>
            <p className="mt-1 text-sm text-gray-500">{selectedChannel?.description || "Messagerie du club"}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
            {messages.map((item) => (
              <div key={item._id} className={`max-w-[78%] rounded-2xl px-4 py-3 ${item.sender._id === user?._id ? "ml-auto bg-[#0EA8A8] text-white" : "bg-slate-100 text-slate-800"}`}>
                <p className="mb-1 text-xs font-semibold opacity-80">{item.sender.name}</p>
                <p className="whitespace-pre-wrap text-sm">{item.content}</p>
                <p className="mt-2 text-[11px] opacity-70">{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
              </div>
            ))}

            {selectedChannelId && messages.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun message dans ce channel.</p>
            ) : null}
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <div className="flex gap-3">
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void sendMessage();
                  }
                }}
                placeholder="Ecrire un message..."
              />
              <Button onClick={sendMessage} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
