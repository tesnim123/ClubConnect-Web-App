import { useEffect, useState, useRef } from "react";
import {
  Hash,
  Lock,
  Plus,
  Send,
  Paperclip,
  Smile,
  X,
  Reply,
  Trash,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
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
  const [availableClubMembers, setAvailableClubMembers] = useState<
    AdminClub["members"]
  >([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // New Chat Features State
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChannelMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChannel = channels.find(
    (channel) => channel._id === selectedChannelId,
  );

  const loadChannels = async () => {
    if (!token) {
      return;
    }

    const response = await apiRequest<{ items: Channel[] }>("/channels/my", {
      token,
    });
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
    const response = await apiRequest<{ club: AdminClub }>(`/clubs/${clubId}`, {
      token,
    });
    setAvailableClubMembers(response.club.members);
  };

  const loadMessages = async (channelId: string) => {
    if (!token || !channelId) {
      return;
    }

    const response = await apiRequest<{ items: ChannelMessage[] }>(
      `/channels/${channelId}/messages`,
      { token },
    );
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
      const channelValue =
        typeof payload.channel === "string"
          ? payload.channel
          : payload.channel._id;
      if (channelValue === selectedChannelId) {
        setMessages((prev) => [...prev, payload]);
      }
    };

    const handleMessageDeleted = (payload: {
      messageId: string;
      content: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === payload.messageId
            ? {
                ...msg,
                isDeleted: true,
                content: payload.content,
                attachment: null,
              }
            : msg,
        ),
      );
    };

    const handleMessageUpdated = (payload: ChannelMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === payload._id ? payload : msg)),
      );
    };

    const handleSync = async () => {
      await loadChannels();
    };

    socket.on("channel:message:new", handleNewMessage);
    socket.on("channel:message:deleted", handleMessageDeleted);
    socket.on("channel:message:updated", handleMessageUpdated);
    socket.on("channels:sync", handleSync);

    return () => {
      socket.off("channel:message:new", handleNewMessage);
      socket.off("channel:message:deleted", handleMessageDeleted);
      socket.off("channel:message:updated", handleMessageUpdated);
      socket.off("channels:sync", handleSync);
    };
  }, [selectedChannelId, token]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 50 Mo)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment(reader.result as string);
      setAttachmentName(file.name);
      setAttachmentType(file.type.startsWith("image/") ? "image" : "file");
    };
    reader.readAsDataURL(file);
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentName(null);
    setAttachmentType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiObj: any) => {
    setMessage((prev) => prev + emojiObj.emoji);
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const sendMessage = async () => {
    if (!token || !selectedChannelId || (!message.trim() && !attachment)) {
      return;
    }

    const socket = getSocket(token);
    socket.emit(
      "channel:message",
      {
        channelId: selectedChannelId,
        content: message,
        attachment,
        attachmentName,
        attachmentType,
        replyTo: replyTo?._id,
      },
      (response: { error?: string }) => {
        if (response?.error) {
          toast.error(response.error);
        } else {
          setMessage("");
          clearAttachment();
          setReplyTo(null);
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        }
      },
    );
  };

  const deleteMessage = (messageId: string) => {
    const socket = getSocket(token!);
    socket.emit(
      "channel:message:delete",
      { messageId },
      (res: { error?: string }) => {
        if (res?.error) toast.error(res.error);
      },
    );
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    const socket = getSocket(token!);
    socket.emit(
      "channel:message:react",
      { messageId, emoji },
      (res: { error?: string }) => {
        if (res?.error) toast.error(res.error);
      },
    );
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
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_280px]">
        <Card className="rounded-[1.5rem] border-0 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] hidden xl:block">
          <h2 className="mb-4 text-lg font-bold text-[#10233F]">
            Vos channels
          </h2>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => setSelectedChannelId(channel._id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                  selectedChannelId === channel._id
                    ? "bg-[#0EA8A8]/10 text-[#0EA8A8]"
                    : "hover:bg-slate-50"
                }`}
              >
                {channel.isSystem ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Hash className="h-4 w-4" />
                )}
                <div>
                  <p className="font-semibold">{channel.name}</p>
                  <p className="text-xs text-gray-500">{channel.type}</p>
                </div>
              </button>
            ))}
          </div>

          {canCreateCustomChannel ? (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-[#10233F]">
                Creer un canal personnalise
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Nom du canal"
                  value={newChannelName}
                  onChange={(event) => setNewChannelName(event.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={newChannelDescription}
                  onChange={(event) =>
                    setNewChannelDescription(event.target.value)
                  }
                  className="min-h-24"
                />
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-3">
                  {availableClubMembers.map((member) => (
                    <label
                      key={member._id}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(member._id)}
                        onChange={(event) =>
                          setSelectedMemberIds((prev) =>
                            event.target.checked
                              ? [...prev, member._id]
                              : prev.filter((item) => item !== member._id),
                          )
                        }
                      />
                      <span>{member.name}</span>
                    </label>
                  ))}

                  {availableClubMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Aucun membre disponible.
                    </p>
                  ) : null}
                </div>
                <Button
                  onClick={createChannel}
                  className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Creer
                </Button>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Chat Area */}
        <Card className="flex min-h-[560px] flex-col rounded-[1.5rem] border-0 bg-white p-0 shadow-[0_18px_45px_rgba(15,23,42,0.08)] relative">
          <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#10233F]">
                {selectedChannel?.name ?? "Selectionnez un channel"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedChannel?.description || "Messagerie du club"}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 bg-slate-50/50">
            {messages.map((item) => {
              const isMine = item.sender._id === user?._id;
              const canDelete =
                isMine || ["ADMIN", "PRESIDENT"].includes(user?.role || "");

              return (
                <div
                  key={item._id}
                  className={`group flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? "bg-[#0EA8A8] text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"}`}
                  >
                    {/* Reply To Preview */}
                    {item.replyTo && (
                      <div
                        className={`mb-2 rounded flex items-center gap-2 p-2 text-xs border-l-2 ${isMine ? "bg-white/10 border-white/40" : "bg-slate-100 border-[#0EA8A8]"}`}
                      >
                        <div className="line-clamp-1 truncate">
                          <span className="font-semibold">
                            {item.replyTo.sender?.name}:
                          </span>{" "}
                          {item.replyTo.content || "Fichier ou image"}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-3 mb-1">
                      <p className="text-xs font-semibold opacity-80">
                        {item.sender.name}
                      </p>
                      <p className="text-[10px] opacity-70">
                        {new Date(item.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Message Content */}
                    <div className="whitespace-pre-wrap text-sm break-words">
                      {item.content}
                    </div>

                    {/* Attachments */}
                    {item.attachment && !item.isDeleted && (
                      <div className="mt-2">
                        {item.attachmentType === "image" ? (
                          <img
                            src={item.attachment}
                            alt="attachment"
                            className="max-w-full rounded-lg max-h-60 object-cover"
                          />
                        ) : (
                          <a
                            href={item.attachment}
                            download={item.attachmentName}
                            className={`flex items-center gap-2 text-sm underline ${isMine ? "text-white" : "text-blue-600"}`}
                          >
                            <FileText className="h-4 w-4" />
                            {item.attachmentName}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Reactions Display */}
                    {item.reactions && item.reactions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.reactions.map((react, i) => {
                          const hasReacted = react.users.includes(
                            user?._id || "",
                          );
                          return (
                            <button
                              key={i}
                              onClick={() =>
                                reactToMessage(item._id, react.emoji)
                              }
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${hasReacted ? "bg-blue-100 text-blue-800" : "bg-white/20 text-inherit border border-slate-200"}`}
                            >
                              <span>{react.emoji}</span>
                              <span className="opacity-80">
                                {react.users.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions Menu (Hover) */}
                  {!item.isDeleted && (
                    <div
                      className={`mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? "flex-row-reverse mr-1" : "ml-1"}`}
                    >
                      <button
                        onClick={() => setReplyTo(item)}
                        className="text-gray-400 hover:text-[#0EA8A8]"
                        title="Repondre"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => reactToMessage(item._id, "👍")}
                        className="text-gray-400 hover:text-blue-500"
                        title="Aimer"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => deleteMessage(item._id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Supprimer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {selectedChannelId && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400 bg-white px-4 py-2 rounded-full shadow-sm">
                  Aucun message. Commencez la discussion.
                </p>
              </div>
            ) : null}
          </div>

          {/* Chat Input Container */}
          <div className="relative border-t border-slate-100 px-4 py-3 bg-white rounded-b-[1.5rem]">
            {/* Reply Preview */}
            {replyTo && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 p-2 text-sm border-l-2 border-[#0EA8A8]">
                <div className="text-slate-600 truncate">
                  <span className="font-semibold mr-1">
                    Reponse a {replyTo.sender.name}:
                  </span>
                  {replyTo.content || "Fichier joint"}
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Attachment Preview */}
            {attachment && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-blue-50 p-2 text-sm text-blue-700">
                <div className="flex items-center gap-2 truncate">
                  {attachmentType === "image" ? (
                    <ImageIcon className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="truncate">{attachmentName}</span>
                </div>
                <button
                  onClick={clearAttachment}
                  className="hover:text-blue-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2 bg-slate-50 rounded-2xl p-2 border border-slate-200">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 rounded-full flex-shrink-0 text-slate-500 hover:text-[#0EA8A8]"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="h-8 w-8 rounded-full flex-shrink-0 text-slate-500 hover:text-yellow-500"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                {showEmojiPicker && (
                  <div className="absolute bottom-10 left-0 z-50">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowEmojiPicker(false)}
                    ></div>
                    <div className="relative z-10 shadow-xl rounded-xl">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={300}
                        height={400}
                      />
                    </div>
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onInput={handleInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ecrivez votre message..."
                className="flex-1 max-h-[120px] min-h-[36px] resize-none bg-transparent py-1.5 px-2 text-sm focus:outline-none scrollbar-thin overflow-y-auto"
                rows={1}
              />

              <Button
                onClick={sendMessage}
                disabled={!message.trim() && !attachment}
                className="h-8 w-8 rounded-full flex-shrink-0 bg-[#0EA8A8] p-0 hover:bg-[#0c8e8e] disabled:opacity-50"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Sidebar - Members */}
        {selectedChannel && (
          <Card className="hidden xl:flex flex-col rounded-[1.5rem] border-0 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-bold text-[#10233F] mb-4">
              Membres du canal
            </h2>
            <div className="space-y-3 overflow-y-auto flex-1">
              {(selectedChannel.members as any[]).map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center font-semibold text-xs text-[#0EA8A8]">
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-semibold truncate">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
