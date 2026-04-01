import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  Check,
  Hash,
  Lock,
  Plus,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Textarea } from "../../components/ui/textarea";
import { useLocation } from "react-router";
import { channels as seedChannels, members as seedMembers, messages as seedMessages } from "../../data/mockData";
import type { Channel, Message } from "../../data/mockData";

export default function ChannelManagement() {
  const location = useLocation();
  const isPresidentView = location.pathname.startsWith("/president");
  const actor = isPresidentView
    ? seedMembers.find((member) => member.role === "president") ?? seedMembers[0]
    : seedMembers.find((member) => member.role === "staff") ?? seedMembers[0];
  const [channels, setChannels] = useState<Channel[]>(
    seedChannels.filter((channel) => !channel.clubId || channel.clubId === actor.clubId),
  );
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id ?? "");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMemberList, setShowMemberList] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [inviteQuery, setInviteQuery] = useState("");
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const currentMessages = useMemo(
    () => seedMessages.filter((message) => message.channelId === selectedChannelId),
    [selectedChannelId],
  );

  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];
  const availableMembers = seedMembers.filter(
    (member) =>
      member.clubId === actor.clubId &&
      member.id !== actor.id &&
      member.status === "active",
  );

  const suggestedMembers = availableMembers.filter(
    (member) =>
      !invitedIds.includes(member.id) &&
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(inviteQuery.toLowerCase()),
  );

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const channelMembers = availableMembers.filter((member) => selectedChannel?.members.includes(member.id));

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    toast.success("Message envoye.");
    setMessageInput("");
  };

  const addInvitedMember = (memberId: string) => {
    setInvitedIds((prev) => [...prev, memberId]);
    setInviteQuery("");
  };

  const createChannel = () => {
    if (!newChannelName.trim()) {
      toast.error("Le titre du canal est obligatoire.");
      return;
    }

    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
      type: "staff",
      clubId: actor.clubId,
      description: newChannelDescription || "Nouveau canal du club",
      icon: invitedIds.length > 0 ? "users" : "#",
      unreadCount: 0,
      members: [actor.id, ...invitedIds],
      isPrivate: true,
    };

    setChannels((prev) => [newChannel, ...prev]);
    setSelectedChannelId(newChannel.id);
    setNewChannelName("");
    setNewChannelDescription("");
    setInvitedIds([]);
    setInviteQuery("");
    setIsCreateOpen(false);
    toast.success("Canal cree avec succes.");
  };

  return (
    <div className="flex h-screen">
      <Sidebar role={isPresidentView ? "president" : "staff"} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userId={actor.id}
          userName={`${actor.firstName} ${actor.lastName}`}
          userAvatar={actor.avatar}
          userRole={isPresidentView ? "President" : "Staff"}
          userRoleType={isPresidentView ? "president" : "staff"}
          notificationCount={channels.length}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-bold text-[#1B2A4A]">Canaux</h2>
                  <p className="text-sm text-gray-600">{actor.clubName}</p>
                </div>
                <Button size="sm" className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedChannelId === channel.id
                        ? "bg-[#0EA8A8]/10 text-[#0EA8A8]"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {channel.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                    <span className="flex-1 truncate">{channel.name}</span>
                    {channel.unreadCount > 0 && (
                      <Badge className="bg-[#F5A623] h-5 min-w-5 px-1">{channel.unreadCount}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col bg-[#F7F8FC] min-h-0">
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedChannel?.isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <Hash className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <h3 className="font-bold text-[#1B2A4A]">{selectedChannel?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedChannel?.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setIsMuted((prev) => !prev)}>
                  {isMuted ? <BellOff className="w-4 h-4 text-[#0EA8A8]" /> : <Bell className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowMemberList((prev) => !prev)}>
                  <Users className="w-4 h-4 mr-2" />
                  {selectedChannel?.members.length ?? 0}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
              {currentMessages.map((message: Message) => {
                const isOwn = message.senderId === actor.id;
                return (
                  <div key={message.id} className={`flex items-start gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                    {!isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[72%] ${isOwn ? "text-right" : ""}`}>
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-[#1B2A4A]">{message.senderName}</span>
                        </div>
                      )}
                      <div className={`p-3 rounded-lg ${isOwn ? "bg-[#0EA8A8] text-white" : "bg-white border border-gray-200"}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Envoyer un message dans #${selectedChannel?.name ?? ""}`}
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                />
                <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {showMemberList && (
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-bold text-[#1B2A4A]">Participants</h3>
                <p className="text-sm text-gray-600">{selectedChannel?.members.length ?? 0} personnes</p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {channelMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1B2A4A] truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Creer un canal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">Titre</label>
              <Input value={newChannelName} onChange={(event) => setNewChannelName(event.target.value)} placeholder="Nom du canal" />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">Description</label>
              <Textarea
                value={newChannelDescription}
                onChange={(event) => setNewChannelDescription(event.target.value)}
                placeholder="Description du canal"
                className="min-h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">Inviter des membres</label>
              <div className="relative">
                <Input
                  value={inviteQuery}
                  onChange={(event) => setInviteQuery(event.target.value)}
                  placeholder="Commencez a taper un nom..."
                />
                {inviteQuery.trim() && suggestedMembers.length > 0 && (
                  <Card className="absolute z-20 mt-2 w-full p-2 shadow-lg">
                    <div className="space-y-1">
                      {suggestedMembers.slice(0, 5).map((member) => (
                        <button
                          key={member.id}
                          className="w-full rounded-lg px-3 py-2 text-left hover:bg-gray-50"
                          onClick={() => addInvitedMember(member.id)}
                        >
                          {member.firstName} {member.lastName}
                        </button>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {invitedIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {invitedIds.map((memberId) => {
                    const member = availableMembers.find((item) => item.id === memberId);
                    if (!member) return null;
                    return (
                      <Badge key={memberId} className="bg-[#1B2A4A] flex items-center gap-2">
                        {member.firstName} {member.lastName}
                        <button onClick={() => setInvitedIds((prev) => prev.filter((id) => id !== memberId))}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" onClick={createChannel}>
              <Check className="w-4 h-4 mr-2" />
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
