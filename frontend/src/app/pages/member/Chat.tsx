// pages/member/Chat.tsx
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, channels, members } from "../../data/mockData";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { 
  Hash, Users, Send, Paperclip, Smile, File, Search,
  Bell, BellOff, Image, X, Reply, Trash2, Download, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  deleted?: boolean;
}

// Données d'exemple pour les messages
const initialMessages: { [key: string]: Message[] } = {
  general: [
    {
      id: "1",
      channelId: "general",
      senderId: "user2",
      senderName: "Jean Dupont",
      content: "Bienvenue à tous sur le canal général !",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      reactions: [{ emoji: "👍", count: 2, userIds: ["user1", "user3"] }]
    },
    {
      id: "2",
      channelId: "general",
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      content: "Merci ! Content d'être là",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      reactions: []
    }
  ],
  announcements: [
    {
      id: "1",
      channelId: "announcements",
      senderId: "admin",
      senderName: "Admin",
      content: "Réunion importante demain à 14h",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      attachments: [
        {
          id: "att1",
          name: "ordre_du_jour.pdf",
          size: 245000,
          type: "application/pdf",
          url: "#"
        }
      ],
      reactions: []
    }
  ]
};

export default function MemberChat() {
  const [user, setUser] = useState(currentUser);
  const [selectedChannel, setSelectedChannel] = useState(() => {
    const firstPublicChannel = channels.find(channel => !channel.isPrivate && channel.members.includes(currentUser.id));
    return firstPublicChannel || channels[0];
  });
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMemberList, setShowMemberList] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ [key: string]: Message[] }>(initialMessages);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      }
    };
    
    loadUser();
    
    const handleUserUpdated = () => {
      loadUser();
    };
    
    window.addEventListener('userUpdated', handleUserUpdated);
    return () => window.removeEventListener('userUpdated', handleUserUpdated);
  }, []);

  // Fermer les sélecteurs quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setReactionPickerMessageId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, selectedChannel]);

  // Filtrer uniquement les canaux publics
  const publicChannels = channels.filter(channel => 
    !channel.isPrivate && channel.members.includes(user.id)
  );

  const filteredChannels = publicChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = chatMessages[selectedChannel.id] || [];
  const channelMembers = members.filter(m => selectedChannel.members.includes(m.id));

  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;

    setIsUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAttachments: Attachment[] = attachments.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }));

      const newMessage: Message = {
        id: Date.now().toString(),
        channelId: selectedChannel.id,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        content: messageInput,
        timestamp: new Date().toISOString(),
        attachments: newAttachments.length > 0 ? newAttachments : undefined,
        reactions: [],
        replyTo: replyTo ? {
          id: replyTo.id,
          senderName: replyTo.senderName,
          content: replyTo.content
        } : undefined
      };

      setChatMessages(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMessage]
      }));
      
      setMessageInput("");
      setAttachments([]);
      setReplyTo(null);
      toast.success(attachments.length > 0 ? "Message et fichiers envoyés" : "Message envoyé");
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <File className="w-4 h-4 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return <Image className="w-4 h-4 text-green-500" />;
    return <Paperclip className="w-4 h-4 text-gray-500" />;
  };

  const onEmojiClick = (emojiObject: any) => {
    setMessageInput(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Ajouter/retirer une réaction
  const handleReaction = (messageId: string, emoji: string) => {
    const channelMessages = [...(chatMessages[selectedChannel.id] || [])];
    const msgIndex = channelMessages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const msg = { ...channelMessages[msgIndex] };
    
    // Ne pas permettre les réactions sur les messages supprimés
    if (msg.deleted) return;
    
    const reactions = [...(msg.reactions || [])];
    const existingIndex = reactions.findIndex(r => r.emoji === emoji);

    if (existingIndex >= 0) {
      const r = { ...reactions[existingIndex] };
      if (r.userIds.includes(user.id)) {
        r.userIds = r.userIds.filter(id => id !== user.id);
        r.count -= 1;
        if (r.count === 0) {
          reactions.splice(existingIndex, 1);
        } else {
          reactions[existingIndex] = r;
        }
      } else {
        r.userIds = [...r.userIds, user.id];
        r.count += 1;
        reactions[existingIndex] = r;
      }
    } else {
      reactions.push({ emoji, count: 1, userIds: [user.id] });
    }

    msg.reactions = reactions;
    channelMessages[msgIndex] = msg;
    setChatMessages({ ...chatMessages, [selectedChannel.id]: channelMessages });
    setReactionPickerMessageId(null);
  };

  // Supprimer son propre message - comme dans Communication
  const handleDeleteMessage = (messageId: string) => {
    const channelMessages = (chatMessages[selectedChannel.id] || []).map(m =>
      m.id === messageId ? { 
        ...m, 
        deleted: true, 
        content: "Vous avez supprimé ce message",
        attachments: undefined,
        reactions: [] // Les réactions disparaissent
      } : m
    );
    setChatMessages({ ...chatMessages, [selectedChannel.id]: channelMessages });
    setDeleteConfirmMessageId(null);
    toast.success("Message supprimé");
  };

  const handleReply = (message: Message) => {
    // Ne pas permettre de répondre à un message supprimé
    if (message.deleted) {
      toast.error("Impossible de répondre à un message supprimé");
      return;
    }
    setReplyTo(message);
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    window.open(attachment.url, '_blank');
    toast.success(`Téléchargement de ${attachment.name}...`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} h`;
    if (days === 1) return "Hier";
    return format(date, 'dd MMM', { locale: fr });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwnMessage = message.senderId === user.id;
    const isDeleted = message.deleted === true;
    
    return (
      <div className={`flex gap-3 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        {!isOwnMessage && !isDeleted && (
          <Avatar className="w-8 h-8 shrink-0 mt-1">
            <AvatarFallback className="bg-[#0EA8A8] text-white text-xs">
              {message.senderName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Avatar placeholder pour message supprimé (espace vide) */}
        {!isOwnMessage && isDeleted && (
          <div className="w-8 h-8 shrink-0 mt-1" />
        )}

        <div className={`flex-1 flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Nom + heure - Ne pas afficher le nom pour les messages supprimés */}
          {!isDeleted && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">{message.senderName}</span>
              <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
            </div>
          )}
          
          {/* Afficher juste l'heure pour les messages supprimés (alignée à droite) */}
          {isDeleted && isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
            </div>
          )}

          {/* Citation de réponse - Ne pas afficher pour les messages supprimés */}
          {!isDeleted && message.replyTo && (
            <div className={`mb-1 px-3 py-1.5 rounded-lg border-l-2 border-[#0EA8A8] bg-gray-100 max-w-[70%] text-left`}>
              <p className="text-xs font-semibold text-[#0EA8A8]">{message.replyTo.senderName}</p>
              <p className="text-xs text-gray-500 truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Bulle du message */}
          <div className={`relative flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
            {/* Bulle */}
            <div className={`relative max-w-[70%] px-4 py-2 rounded-2xl ${
              isDeleted
                ? 'bg-gray-100 border border-dashed border-gray-300 italic text-gray-400 text-sm'
                : isOwnMessage
                  ? 'bg-[#0EA8A8] text-white'
                  : 'bg-white border border-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-wrap break-words">
                {isDeleted ? "Ce message a été supprimé" : message.content}
              </p>
              
              {/* Attachments - Ne pas afficher pour les messages supprimés */}
              {!isDeleted && message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((file) => (
                    <div key={file.id} className={`flex items-center gap-2 p-2 rounded-lg ${
                      isOwnMessage ? 'bg-white/20' : 'bg-gray-50'
                    }`}>
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs opacity-75">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={isOwnMessage ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:text-[#0EA8A8]'}
                        onClick={() => handleDownloadAttachment(file)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions flottantes (hover) - Uniquement pour les messages non supprimés */}
            {!isDeleted && (
              <div className={`flex items-center gap-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                {/* Réagir */}
                <div className="relative" ref={reactionPickerMessageId === message.id ? reactionPickerRef : null}>
                  <button
                    onClick={() => setReactionPickerMessageId(reactionPickerMessageId === message.id ? null : message.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-500"
                    title="Réagir"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  {reactionPickerMessageId === message.id && (
                    <div className={`absolute bottom-9 ${isOwnMessage ? 'right-0' : 'left-0'} z-50 flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1`}>
                      {QUICK_REACTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(message.id, emoji)}
                          className="text-lg hover:scale-125 transition-transform p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Répondre */}
                <button
                  onClick={() => handleReply(message)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-500"
                  title="Répondre"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>

                {/* Supprimer (seulement ses propres messages) */}
                {isOwnMessage && (
                  <button
                    onClick={() => setDeleteConfirmMessageId(message.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-gray-500"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Réactions - Ne pas afficher pour les messages supprimés */}
          {!isDeleted && message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {message.reactions.map(reaction => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReaction(message.id, reaction.emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                    reaction.userIds?.includes(user.id)
                      ? 'bg-[#0EA8A8]/10 border-[#0EA8A8] text-[#0EA8A8]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredMembers = channelMembers.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          userAvatar={user.avatar}
          userRole={user.roleLabel || "Membre"}
          userRoleType={user.role}
          notificationCount={3}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Channel List - Public channels only */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-[#1B2A4A]">Canaux publics</h2>
              <p className="text-sm text-gray-600">{user.clubName}</p>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un canal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredChannels.length > 0 ? (
                  filteredChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannel(channel);
                        setReplyTo(null);
                        setReactionPickerMessageId(null);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedChannel.id === channel.id
                          ? 'bg-[#0EA8A8]/10 text-[#0EA8A8]'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Hash className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{channel.name}</span>
                      {channel.unreadCount > 0 && (
                        <Badge className="bg-[#F5A623] h-5 min-w-5 px-1">{channel.unreadCount}</Badge>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun canal public</p>
                    <p className="text-xs mt-1">Tous les canaux sont privés</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col bg-[#F7F8FC] min-h-0">
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-bold text-[#1B2A4A]">{selectedChannel.name}</h3>
                  <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMuted(!isMuted)}
                  className={isMuted ? 'text-[#0EA8A8]' : ''}
                >
                  {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowMemberList(!showMemberList)}>
                  <Users className="w-4 h-4 mr-2" />
                  {selectedChannel.members.length}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentMessages.length > 0 ? (
                currentMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun message dans ce canal</p>
                    <p className="text-sm">Soyez le premier à envoyer un message !</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Indicator */}
            {replyTo && (
              <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium">Réponse à {replyTo.senderName}</span>
                    <p className="text-xs text-gray-500 line-clamp-1">{replyTo.content}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              {attachments.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Pièces jointes ({attachments.length})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachments([])}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                        {getFileIcon(file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="shrink-0"
                  title="Joindre un fichier"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                {/* Bouton Emoji avec EmojiPicker */}
                <div className="relative" ref={emojiPickerRef}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={isUploading}
                    className="shrink-0"
                    title="Ajouter un emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-0 z-50">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        autoFocusSearch={false}
                        skinTonesDisabled={true}
                        searchPlaceholder="Rechercher un emoji..."
                        width={350}
                        height={400}
                      />
                    </div>
                  )}
                </div>
                
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Envoyer un message dans #${selectedChannel.name}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isUploading}
                  className="flex-1"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={isUploading || (!messageInput.trim() && attachments.length === 0)}
                  className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Vous pouvez joindre des fichiers (images, PDF, documents) ou ajouter des emojis
              </p>
            </div>
          </div>

          {/* Members Sidebar */}
          {showMemberList && (
            <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-bold text-[#1B2A4A]">Membres</h3>
                <p className="text-sm text-gray-600">{selectedChannel.members.length} membres</p>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 group">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-[#0EA8A8] text-white text-xs">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {member.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
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

      {/* Dialogue de confirmation pour la suppression d'un message */}
      {deleteConfirmMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirmMessageId(null)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#1B2A4A]">Supprimer le message</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmMessageId(null)}>Annuler</Button>
              <Button onClick={() => handleDeleteMessage(deleteConfirmMessageId)} className="bg-red-500 hover:bg-red-600">
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}