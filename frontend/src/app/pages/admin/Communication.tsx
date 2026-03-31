// pages/admin/Communication.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Download } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  Send, 
  Search,
  ChevronRight,
  ChevronDown,
  Building,
  Star,
  Shield,
  Crown,
  Mail,
  Phone,
  MoreVertical,
  Pin,
  Bell,
  User,
  Check,
  Clock,
  Paperclip,
  Image,
  FileText,
  X
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isAdmin: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'global_staff' | 'club_staff' | 'presidents' | 'vice_presidents' | 'club_leadership';
  clubName?: string;
  clubId?: string;
  description: string;
  members: number;
  unreadCount: number;
  lastMessage?: Message;
  icon: any;
  color: string;
}

// Données d'exemple pour les canaux
const mockChannels: Channel[] = [
  {
    id: "global_staff",
    name: "Staff Global",
    type: "global_staff",
    description: "Canal de communication avec tous les staff de tous les clubs",
    members: 24,
    unreadCount: 3,
    icon: Users,
    color: "from-purple-500 to-purple-700"
  },
  {
    id: "club1_staff",
    name: "Staff - Club Informatique",
    type: "club_staff",
    clubName: "Club d'Informatique",
    clubId: "club1",
    description: "Canal avec le staff du Club d'Informatique",
    members: 8,
    unreadCount: 1,
    icon: Building,
    color: "from-[#0EA8A8] to-[#1B2A4A]"
  },
  {
    id: "club2_staff",
    name: "Staff - Club Sportif",
    type: "club_staff",
    clubName: "Club Sportif",
    clubId: "club2",
    description: "Canal avec le staff du Club Sportif",
    members: 6,
    unreadCount: 0,
    icon: Building,
    color: "from-blue-500 to-blue-700"
  },
  {
    id: "club3_staff",
    name: "Staff - Club Artistique",
    type: "club_staff",
    clubName: "Club Artistique",
    clubId: "club3",
    description: "Canal avec le staff du Club Artistique",
    members: 5,
    unreadCount: 2,
    icon: Building,
    color: "from-purple-500 to-purple-700"
  },
  {
    id: "presidents",
    name: "Présidents",
    type: "presidents",
    description: "Canal avec tous les présidents des clubs",
    members: 5,
    unreadCount: 0,
    icon: Crown,
    color: "from-yellow-500 to-yellow-700"
  },
  {
    id: "vice_presidents",
    name: "Vice-présidents",
    type: "vice_presidents",
    description: "Canal avec tous les vice-présidents des clubs",
    members: 5,
    unreadCount: 0,
    icon: Shield,
    color: "from-indigo-500 to-indigo-700"
  },
  {
    id: "club1_leadership",
    name: "Direction - Club Informatique",
    type: "club_leadership",
    clubName: "Club d'Informatique",
    clubId: "club1",
    description: "Canal avec président et vice-président du Club Informatique",
    members: 2,
    unreadCount: 1,
    icon: Star,
    color: "from-[#0EA8A8] to-[#1B2A4A]"
  },
  {
    id: "club2_leadership",
    name: "Direction - Club Sportif",
    type: "club_leadership",
    clubName: "Club Sportif",
    clubId: "club2",
    description: "Canal avec président et vice-président du Club Sportif",
    members: 2,
    unreadCount: 0,
    icon: Star,
    color: "from-blue-500 to-blue-700"
  }
];

// Données d'exemple pour les messages
const mockMessages: { [key: string]: Message[] } = {
  global_staff: [
    {
      id: "1",
      senderId: "staff1",
      senderName: "Marie Martin",
      content: "Bonjour à tous, une réunion est prévue demain à 14h pour discuter des prochains événements.",
      timestamp: "2024-03-20T10:30:00",
      isRead: false,
      isAdmin: false,
      attachments: [
        {
          id: "att1",
          name: "ordre_du_jour.pdf",
          size: 245000,
          type: "application/pdf",
          url: "#"
        }
      ]
    },
    {
      id: "2",
      senderId: "staff2",
      senderName: "Pierre Durand",
      content: "Je serai présent. Faut-il préparer quelque chose spécifiquement ?",
      timestamp: "2024-03-20T10:35:00",
      isRead: false,
      isAdmin: false
    },
    {
      id: "3",
      senderId: "admin",
      senderName: "Admin",
      content: "Merci pour l'info Marie. Je confirme ma présence.",
      timestamp: "2024-03-20T10:40:00",
      isRead: true,
      isAdmin: true
    }
  ],
  club1_staff: [
    {
      id: "1",
      senderId: "staff1",
      senderName: "Jean Dupont",
      content: "L'événement Hackathon approche, nous devons finaliser les détails logistiques.",
      timestamp: "2024-03-20T09:00:00",
      isRead: false,
      isAdmin: false,
      attachments: [
        {
          id: "att2",
          name: "planning_hackathon.xlsx",
          size: 156000,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          url: "#"
        },
        {
          id: "att3",
          name: "logo_hackathon.png",
          size: 456000,
          type: "image/png",
          url: "#"
        }
      ]
    }
  ],
  presidents: [
    {
      id: "1",
      senderId: "pres1",
      senderName: "Jean Dupont",
      content: "Les présidents, une réunion est organisée mercredi prochain pour discuter du budget.",
      timestamp: "2024-03-19T15:00:00",
      isRead: true,
      isAdmin: false
    }
  ]
};

export default function AdminCommunication() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0]);
  const [messageInput, setMessageInput] = useState("");
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(mockMessages);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Catégories de canaux
  const channelCategories = [
    { id: "global", name: "Canaux Généraux", channels: channels.filter(c => c.type === 'global_staff' || c.type === 'presidents' || c.type === 'vice_presidents') },
    { id: "club_staff", name: "Staff par Club", channels: channels.filter(c => c.type === 'club_staff') },
    { id: "leadership", name: "Direction des Clubs", channels: channels.filter(c => c.type === 'club_leadership') }
  ];

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return <Image className="w-4 h-4 text-green-500" />;
    return <Paperclip className="w-4 h-4 text-gray-500" />;
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;

    setIsUploading(true);
    
    try {
      // Simuler l'upload des fichiers
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAttachments: Attachment[] = attachments.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // Simuler une URL après upload
      }));

      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: "admin",
        senderName: "Admin",
        content: messageInput,
        timestamp: new Date().toISOString(),
        isRead: true,
        isAdmin: true,
        attachments: newAttachments.length > 0 ? newAttachments : undefined
      };

      setMessages({
        ...messages,
        [selectedChannel!.id]: [...(messages[selectedChannel!.id] || []), newMessage]
      });
      
      setMessageInput("");
      setAttachments([]);
      toast.success(attachments.length > 0 ? "Message et fichiers envoyés" : "Message envoyé");
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsUploading(false);
    }
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
    return date.toLocaleDateString('fr-FR');
  };

  const getChannelIcon = (channel: Channel) => {
    const Icon = channel.icon;
    return <Icon className="w-5 h-5" />;
  };

  const AttachmentPreview = ({ attachments }: { attachments: Attachment[] }) => (
    <div className="mt-2 space-y-2">
      {attachments.map((file) => (
        <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          {getFileIcon(file.name)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-[#0EA8A8]"
            onClick={() => window.open(file.url, '_blank')}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
  userId="admin_1"
  userName="Admin User"
  userRole="Administrateur"
  userRoleType="admin"
  notificationCount={5}
/>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar des canaux */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-[#1B2A4A] mb-2">Communication</h1>
              <p className="text-sm text-gray-500">Canaux de communication</p>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un canal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {channelCategories.map((category) => {
                const filteredChannels = category.channels.filter(channel =>
                  channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (channel.clubName?.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                if (filteredChannels.length === 0) return null;

                const isCollapsed = collapsedCategories.has(category.id);

                return (
                  <div key={category.id} className="border-b border-gray-100">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.name}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {!isCollapsed && (
                      <div className="pb-2">
                        {filteredChannels.map((channel) => (
                          <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                              selectedChannel?.id === channel.id ? 'bg-[#0EA8A8]/10 border-r-2 border-[#0EA8A8]' : ''
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${channel.color} flex items-center justify-center text-white`}>
                              {getChannelIcon(channel)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-[#1B2A4A] truncate">
                                  {channel.name}
                                </p>
                                {channel.unreadCount > 0 && (
                                  <Badge className="bg-[#0EA8A8] text-white text-xs">
                                    {channel.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {channel.members} membre{channel.members > 1 ? 's' : ''}
                              </p>
                              {channel.lastMessage && (
                                <p className="text-xs text-gray-400 truncate mt-1">
                                  {channel.lastMessage.content}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zone de chat */}
          {selectedChannel ? (
            <div className="flex-1 flex flex-col bg-[#F7F8FC]">
              {/* En-tête du chat */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${selectedChannel.color} flex items-center justify-center text-white`}>
                    {getChannelIcon(selectedChannel)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1B2A4A]">{selectedChannel.name}</h2>
                    <p className="text-sm text-gray-500">{selectedChannel.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      {selectedChannel.members} membres
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(messages[selectedChannel.id] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isAdmin ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={message.isAdmin ? 'bg-[#0EA8A8] text-white' : 'bg-gray-200'}>
                        {message.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 ${message.isAdmin ? 'flex justify-end' : ''}`}>
                      <div className={`inline-block max-w-[70%] ${message.isAdmin ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{message.senderName}</span>
                          <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                          {message.isAdmin && (
                            <Badge variant="outline" className="text-xs bg-[#0EA8A8]/10 text-[#0EA8A8]">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${
                          message.isAdmin 
                            ? 'bg-[#0EA8A8] text-white' 
                            : 'bg-white border border-gray-200'
                        }`}>
                          {message.content && <p className="text-sm">{message.content}</p>}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((file) => (
                                <div key={file.id} className={`flex items-center gap-2 p-2 rounded-lg ${
                                  message.isAdmin ? 'bg-white/20' : 'bg-gray-50'
                                }`}>
                                  {getFileIcon(file.name)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs opacity-75">{formatFileSize(file.size)}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={message.isAdmin ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:text-[#0EA8A8]'}
                                    onClick={() => window.open(file.url, '_blank')}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de saisie avec pièces jointes */}
              <div className="bg-white border-t border-gray-200 p-4">
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
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isUploading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && attachments.length === 0) || isUploading}
                    className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? "Envoi..." : "Envoyer"}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Messages envoyés en tant qu'Admin - Vous pouvez joindre des fichiers (images, PDF, documents)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#F7F8FC]">
              <Card className="p-12 text-center max-w-md">
                <MessageSquare className="w-16 h-16 text-[#0EA8A8] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Sélectionnez un canal</h2>
                <p className="text-gray-500">Choisissez un canal de communication pour commencer à discuter</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ajouter l'import manquant pour Download
