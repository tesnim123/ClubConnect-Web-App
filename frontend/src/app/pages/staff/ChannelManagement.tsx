import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  Check,
  FileImage,
  FileText,
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
import type { Channel, FileAttachment, Message } from "../../data/mockData";

export default function ChannelManagement() {
  const location = useLocation();
  const isPresidentView = location.pathname.startsWith("/president");
  const actor = isPresidentView
    ? seedMembers.find((member) => member.role === "president") ?? seedMembers[0]
    : seedMembers.find((member) => member.role === "staff") ?? seedMembers[0];
  const presidentChannels: Channel[] = [
    {
      id: "president-general",
      name: "General",
      type: "general",
      clubId: actor.clubId,
      description: `Canal general du ${actor.clubName}`,
      icon: "#",
      unreadCount: 3,
      members: seedMembers.filter((member) => member.clubId === actor.clubId).map((member) => member.id),
      isPrivate: false,
    },
    {
      id: "president-club-staff",
      name: "Club-staff",
      type: "staff",
      clubId: actor.clubId,
      description: `Canal staff du ${actor.clubName}`,
      icon: "lock",
      unreadCount: 1,
      members: seedMembers
        .filter((member) => member.clubId === actor.clubId && ["staff", "president", "vicepresident"].includes(member.role))
        .map((member) => member.id),
      isPrivate: true,
    },
    {
      id: "president-all-club-staff",
      name: "All-Club-staff",
      type: "staff",
      description: "Canal inter-clubs pour tous les staffs",
      icon: "users",
      unreadCount: 2,
      members: seedMembers
        .filter((member) => ["staff", "president", "vicepresident"].includes(member.role))
        .map((member) => member.id),
      isPrivate: true,
    },
    {
      id: "president-all-club-presidents",
      name: "All-Club-Presidents",
      type: "staff",
      description: "Canal inter-clubs pour tous les presidents",
      icon: "users",
      unreadCount: 0,
      members: seedMembers.filter((member) => member.role === "president").map((member) => member.id),
      isPrivate: true,
    },
    {
      id: "president-administration",
      name: "Administration",
      type: "staff",
      description: "Canal de communication avec l'administration",
      icon: "lock",
      unreadCount: 1,
      members: seedMembers
        .filter((member) => member.role === "admin" || member.role === "president")
        .map((member) => member.id),
      isPrivate: true,
    },
  ];
  const [channels, setChannels] = useState<Channel[]>(
    isPresidentView
      ? presidentChannels
      : seedChannels.filter((channel) => !channel.clubId || channel.clubId === actor.clubId),
  );
  const [messages, setMessages] = useState<Message[]>(seedMessages);
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
  const [pendingAttachments, setPendingAttachments] = useState<FileAttachment[]>([]);
  const [memberInviteQuery, setMemberInviteQuery] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMessages = useMemo(
    () => messages.filter((message) => message.channelId === selectedChannelId),
    [messages, selectedChannelId],
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
  const canManageMembers =
    selectedChannel?.name === "General" ||
    selectedChannel?.name === "Club-staff" ||
    selectedChannel?.name === "robotique-général" ||
    selectedChannel?.name === "robotique-staff";
  const addableMembers = availableMembers.filter(
    (member) =>
      !selectedChannel?.members.includes(member.id) &&
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(memberInviteQuery.toLowerCase()),
  );

  const sendMessage = () => {
    if (!messageInput.trim() && pendingAttachments.length === 0) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `message-${Date.now()}`,
        channelId: selectedChannelId,
        senderId: actor.id,
        senderName: `${actor.firstName} ${actor.lastName}`,
        senderAvatar: actor.avatar,
        content: messageInput.trim() || "Piece jointe partagee.",
        timestamp: new Date().toISOString(),
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
        read: true,
      },
    ]);
    toast.success("Message envoye.");
    setMessageInput("");
    setPendingAttachments([]);
  };

  const handleAttachmentImport = (files: FileList | null, type: "image" | "file") => {
    if (!files || files.length === 0) return;
    const mapped: FileAttachment[] = Array.from(files).map((file, index) => ({
      id: `attachment-${Date.now()}-${index}`,
      name: file.name,
      type: type === "image" ? "image" : "pdf",
      url: "#",
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setPendingAttachments((prev) => [...prev, ...mapped]);
    toast.success(type === "image" ? "Image ajoutee." : "Fichier ajoute.");
  };

  const addMemberToChannel = (memberId: string) => {
    if (!selectedChannel || !canManageMembers) return;
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === selectedChannel.id
          ? { ...channel, members: [...channel.members, memberId] }
          : channel,
      ),
    );
    setMemberInviteQuery("");
    toast.success("Membre ajoute au canal.");
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
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className={`rounded-lg px-3 py-2 text-xs ${isOwn ? "bg-white/15 text-white" : "bg-[#F7F8FC] text-gray-600"}`}
                              >
                                {attachment.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleAttachmentImport(event.target.files, "image")}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => handleAttachmentImport(event.target.files, "file")}
              />
              {pendingAttachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {pendingAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 rounded-full bg-[#F3F6FA] px-3 py-1 text-xs text-gray-600"
                    >
                      <span>{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAttachments((prev) => prev.filter((item) => item.id !== attachment.id))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => imageInputRef.current?.click()}>
                  <FileImage className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="w-4 h-4" />
                </Button>
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
                {canManageMembers && (
                  <div className="mt-3">
                    <Input
                      value={memberInviteQuery}
                      onChange={(event) => setMemberInviteQuery(event.target.value)}
                      placeholder="Ajouter un membre..."
                      className="h-9 text-sm"
                    />
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {canManageMembers && addableMembers.slice(0, 5).map((member) => (
                    <button
                      key={`add-${member.id}`}
                      type="button"
                      onClick={() => addMemberToChannel(member.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#0EA8A8]/40 bg-[#F4FBFB] px-3 py-2 text-left"
                    >
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1B2A4A] truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Ajouter au canal</p>
                      </div>
                      <Plus className="h-4 w-4 text-[#0EA8A8]" />
                    </button>
                  ))}
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
