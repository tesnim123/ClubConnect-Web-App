// pages/member/Chat.tsx
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, channels, messages, members } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { 
  Hash, 
  Lock, 
  Users, 
  Send, 
  Paperclip, 
  Smile, 
  File, 
  Search,
  MoreVertical,
  Pin,
  Bell,
  BellOff,
  Image,
  Mic,
  Video,
  Trash2,
  Edit,
  Reply,
  Copy,
  Check,
  X,
  Plus,
  ChevronDown,
  UserPlus,
  Settings,
  Phone,
  VideoIcon,
  Info,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";

// Importer le type Message depuis mockData ou le définir ici
import { Message as MockMessage } from "../../data/mockData";

// Définir les types locaux qui correspondent exactement à ceux de mockData
interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users?: string[]; // Rendre optionnel pour correspondre à mockData
}

// Étendre le type Message de mockData
interface Message extends MockMessage {
  reactions?: Reaction[];
  isEdited?: boolean;
  replyTo?: Message;
}

export default function MemberChat() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMemberList, setShowMemberList] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const memberData = {
    id: "member_1",
    fullName: `${currentUser.firstName} ${currentUser.lastName}`,
    role: "member",
    roleLabel: "Membre",
    avatar: currentUser.avatar
  };

  // Typer correctement les messages
  const channelMessages = messages.filter(m => m.channelId === selectedChannel.id) as Message[];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;

    setIsUploading(true);
    
    try {
      // Simuler l'upload des fichiers
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAttachments: Attachment[] = attachments.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        url: URL.createObjectURL(file)
      }));

      console.log('Send message:', messageInput, newAttachments);
      toast.success(attachments.length > 0 ? "Message et fichiers envoyés" : "Message envoyé");
      
      setMessageInput("");
      setAttachments([]);
      setReplyTo(null);
      setEditingMessage(null);
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

  const handleEmojiClick = (emoji: any) => {
    setMessageInput(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    toast.success(`Réaction ${emoji} ajoutée`);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm("Supprimer ce message ?")) {
      toast.success("Message supprimé");
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setMessageInput(message.content);
    inputRef.current?.focus();
  };

  const handleSaveEdit = () => {
    if (editingMessage && messageInput.trim()) {
      toast.success("Message modifié");
      setEditingMessage(null);
      setMessageInput("");
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copié");
  };

  const handlePinChannel = () => {
    setIsPinned(!isPinned);
    toast.success(isPinned ? "Canal désépinglé" : "Canal épinglé");
  };

  const handleMuteChannel = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Notifications activées" : "Notifications désactivées");
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 24) {
      return format(date, 'HH:mm', { locale: fr });
    } else if (hours < 48) {
      return `Hier à ${format(date, 'HH:mm', { locale: fr })}`;
    } else {
      return format(date, 'dd MMM à HH:mm', { locale: fr });
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwnMessage = message.senderId === currentUser.id;
    
    return (
      <div className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        {!isOwnMessage && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.senderAvatar} />
            <AvatarFallback>{message.senderName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        )}
        <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-[#1B2A4A]">{message.senderName}</span>
              <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
            </div>
          )}
          
          {message.replyTo && (
            <div className="mb-1 p-2 bg-gray-100 rounded-lg text-xs border-l-2 border-[#0EA8A8]">
              <span className="font-medium">Réponse à {message.replyTo.senderName}</span>
              <p className="text-gray-600 line-clamp-1">{message.replyTo.content}</p>
            </div>
          )}
          
          <div className={`relative group ${isOwnMessage ? 'flex justify-end' : ''}`}>
            <div className={`p-3 rounded-lg ${
              isOwnMessage 
                ? 'bg-[#0EA8A8] text-white' 
                : 'bg-white border border-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">{file.size}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {message.isEdited && (
                <p className="text-xs opacity-70 mt-1">(modifié)</p>
              )}
            </div>
            
            {/* Message Actions */}
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex gap-1`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 bg-white shadow"
                onClick={() => handleReaction(message.id, '👍')}
                title="Réagir"
              >
                <Smile className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 bg-white shadow"
                onClick={() => handleReply(message)}
                title="Répondre"
              >
                <Reply className="w-3 h-3" />
              </Button>
              {isOwnMessage && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 bg-white shadow"
                  onClick={() => handleEditMessage(message)}
                  title="Modifier"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 bg-white shadow"
                onClick={() => handleCopyMessage(message.content)}
                title="Copier"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 bg-white shadow text-red-500 hover:text-red-600"
                onClick={() => handleDeleteMessage(message.id)}
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReaction(message.id, reaction.emoji)}
                  className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs flex items-center gap-1"
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

  const filteredMembers = members.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="member"  />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={memberData.id}
          userName={currentUser.firstName}
          userAvatar={memberData.avatar}
          userRole={memberData.roleLabel}
          userRoleType="member"
          notificationCount={3}
          onLogout={() => {
            // Logique de déconnexion
            localStorage.removeItem('token');
            window.location.href = "/login";
          }}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Channel List */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-[#1B2A4A]">Canaux</h2>
              <p className="text-sm text-gray-600">{currentUser.clubName}</p>
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
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {channels.filter(ch => 
                  ch.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedChannel.id === channel.id
                        ? 'bg-[#0EA8A8]/10 text-[#0EA8A8]'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {channel.isPrivate ? (
                      <Lock className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Hash className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate">{channel.name}</span>
                    {channel.unreadCount > 0 && (
                      <Badge className="bg-[#F5A623] h-5 min-w-5 px-1">{channel.unreadCount}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
            
            
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col bg-[#F7F8FC] min-h-0">
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {selectedChannel.isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <Hash className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <h3 className="font-bold text-[#1B2A4A]">{selectedChannel.name}</h3>
                  <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMuteChannel}
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

            {/* Messages - CORRECTION ICI */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 space-y-4">
                {channelMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
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
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pièces jointes ({attachments.length})</span>
                    <Button variant="ghost" size="sm" onClick={() => setAttachments([])}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                        {file.type.startsWith('image/') ? (
                          <Image className="w-4 h-4 text-blue-500" />
                        ) : (
                          <File className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                          <X className="w-3 h-3" />
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
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <Smile className="w-5 h-5" />
                </Button>
                
                
                <div className="relative flex-1">
                  {editingMessage && (
                    <div className="absolute -top-8 left-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Édition du message...
                    </div>
                  )}
                  <Input
                    ref={inputRef}
                    placeholder={`Envoyer un message dans #${selectedChannel.name}`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (editingMessage ? handleSaveEdit() : handleSendMessage())}
                    className="flex-1"
                  />
                </div>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-16 right-16 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
                
                <Button
                  onClick={editingMessage ? handleSaveEdit : handleSendMessage}
                  disabled={isUploading || (!messageInput.trim() && attachments.length === 0)}
                  className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingMessage ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
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
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.firstName[0]}</AvatarFallback>
                        </Avatar>
                        {member.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1B2A4A] truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}