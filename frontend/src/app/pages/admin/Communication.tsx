// pages/admin/Communication.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { BellOff, Download } from "lucide-react";
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
  X,
  Plus,
  Trash2,
  UserPlus,
  ChevronLeft,
  Smile
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import EmojiPicker from 'emoji-picker-react';

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

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
  reactions?: Reaction[];
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  deleted?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ChannelMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'global_staff' | 'club_staff' | 'presidents' | 'club_president';
  clubName?: string;
  clubId?: string;
  description: string;
  members: number;
  membersList: ChannelMember[];
  unreadCount: number;
  lastMessage?: Message;
  icon: any;
  color: string;
}

// Données d'exemple pour les membres des canaux
const mockMembersList: { [key: string]: ChannelMember[] } = {
  global_staff: [
    { id: "staff1", name: "Marie Martin", email: "marie.martin@example.com", role: "Staff", joinedAt: "2024-01-15" },
    { id: "staff2", name: "Pierre Durand", email: "pierre.durand@example.com", role: "Staff", joinedAt: "2024-01-20" },
    { id: "staff3", name: "Sophie Bernard", email: "sophie.bernard@example.com", role: "Staff", joinedAt: "2024-02-01" },
  ],
  club1_president: [
    { id: "pres1", name: "Jean Dupont", email: "jean.dupont@clubinfo.com", role: "Président", joinedAt: "2024-01-01" },
  ],
  club2_president: [
    { id: "pres2", name: "Thomas Martin", email: "thomas.martin@clubsport.com", role: "Président", joinedAt: "2024-01-01" },
  ],
  club3_president: [
    { id: "pres3", name: "Julie Petit", email: "julie.petit@clubart.com", role: "Présidente", joinedAt: "2024-01-01" },
  ],
  club1_staff: [
    { id: "staff1", name: "Marie Martin", email: "marie.martin@example.com", role: "Staff", joinedAt: "2024-01-15" },
    { id: "staff2", name: "Pierre Durand", email: "pierre.durand@example.com", role: "Staff", joinedAt: "2024-01-20" },
  ]
};

// Données d'exemple pour les canaux
const mockChannels: Channel[] = [
  {
    id: "global_staff",
    name: "Staff Global",
    type: "global_staff",
    description: "Canal de communication avec tous les staff de tous les clubs",
    members: 3,
    membersList: mockMembersList.global_staff,
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
    members: 2,
    membersList: mockMembersList.club1_staff,
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
    members: 0,
    membersList: [],
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
    members: 0,
    membersList: [],
    unreadCount: 2,
    icon: Building,
    color: "from-purple-500 to-purple-700"
  },
  {
    id: "presidents",
    name: "Présidents",
    type: "presidents",
    description: "Canal avec tous les présidents des clubs",
    members: 3,
    membersList: [
      { id: "pres1", name: "Jean Dupont", email: "jean.dupont@clubinfo.com", role: "Président", joinedAt: "2024-01-01" },
      { id: "pres2", name: "Thomas Martin", email: "thomas.martin@clubsport.com", role: "Président", joinedAt: "2024-01-01" },
      { id: "pres3", name: "Julie Petit", email: "julie.petit@clubart.com", role: "Présidente", joinedAt: "2024-01-01" },
    ],
    unreadCount: 0,
    icon: Crown,
    color: "from-yellow-500 to-yellow-700"
  },
  {
    id: "club1_president",
    name: "Président - Club Informatique",
    type: "club_president",
    clubName: "Club d'Informatique",
    clubId: "club1",
    description: "Canal avec le président du Club d'Informatique",
    members: 1,
    membersList: mockMembersList.club1_president,
    unreadCount: 0,
    icon: Crown,
    color: "from-[#0EA8A8] to-[#1B2A4A]"
  },
  {
    id: "club2_president",
    name: "Président - Club Sportif",
    type: "club_president",
    clubName: "Club Sportif",
    clubId: "club2",
    description: "Canal avec le président du Club Sportif",
    members: 1,
    membersList: mockMembersList.club2_president,
    unreadCount: 0,
    icon: Crown,
    color: "from-blue-500 to-blue-700"
  },
  {
    id: "club3_president",
    name: "Président - Club Artistique",
    type: "club_president",
    clubName: "Club Artistique",
    clubId: "club3",
    description: "Canal avec le président du Club Artistique",
    members: 1,
    membersList: mockMembersList.club3_president,
    unreadCount: 0,
    icon: Crown,
    color: "from-purple-500 to-purple-700"
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

// Membres disponibles à ajouter (simulation)
const availableUsers = [
  { id: "user1", name: "Alice Moreau", email: "alice.moreau@example.com", role: "Staff" },
  { id: "user2", name: "Lucas Bernard", email: "lucas.bernard@example.com", role: "Staff" },
  { id: "user3", name: "Emma Dubois", email: "emma.dubois@example.com", role: "Staff" },
  { id: "user4", name: "Hugo Lambert", email: "hugo.lambert@example.com", role: "Staff" },
];

export default function AdminCommunication() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0]);
  const [messageInput, setMessageInput] = useState("");
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(mockMessages);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ChannelMember | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  // Fermer le sélecteur d'emojis quand on clique en dehors
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel]);

  // Catégories de canaux (sans les vice-présidents)
  const channelCategories = [
    { id: "global", name: "Canaux Généraux", channels: channels.filter(c => c.type === 'global_staff' || c.type === 'presidents') },
    { id: "club_staff", name: "Staff par Club", channels: channels.filter(c => c.type === 'club_staff') },
    { id: "club_president", name: "Présidents des Clubs", channels: channels.filter(c => c.type === 'club_president') }
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
        senderId: "admin",
        senderName: "Admin",
        content: messageInput,
        timestamp: new Date().toISOString(),
        isRead: true,
        isAdmin: true,
        attachments: newAttachments.length > 0 ? newAttachments : undefined,
        replyTo: replyTo ? {
          id: replyTo.id,
          senderName: replyTo.senderName,
          content: replyTo.deleted ? "Message supprimé" : replyTo.content
        } : undefined
      };

      setMessages({
        ...messages,
        [selectedChannel!.id]: [...(messages[selectedChannel!.id] || []), newMessage]
      });
      
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

  // Gestion des membres
  const handleRemoveMember = (member: ChannelMember) => {
    setMemberToRemove(member);
    setShowConfirmDialog(true);
  };

  const confirmRemoveMember = () => {
    if (!selectedChannel || !memberToRemove) return;
    
    const updatedMembersList = selectedChannel.membersList.filter(m => m.id !== memberToRemove.id);
    const updatedChannels = channels.map(channel => 
      channel.id === selectedChannel.id 
        ? { ...channel, membersList: updatedMembersList, members: updatedMembersList.length }
        : channel
    );
    
    setChannels(updatedChannels);
    setSelectedChannel({ ...selectedChannel, membersList: updatedMembersList, members: updatedMembersList.length });
    toast.success(`${memberToRemove.name} a été retiré du canal`);
    setShowConfirmDialog(false);
    setMemberToRemove(null);
  };

  const handleAddMember = (user: typeof availableUsers[0]) => {
    if (!selectedChannel) return;
    
    // Vérifier si l'utilisateur est déjà dans le canal
    if (selectedChannel.membersList.some(m => m.id === user.id)) {
      toast.error("Ce membre est déjà dans le canal");
      return;
    }
    
    const newMember: ChannelMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "Staff",
      joinedAt: new Date().toISOString()
    };
    
    const updatedMembersList = [...selectedChannel.membersList, newMember];
    const updatedChannels = channels.map(channel => 
      channel.id === selectedChannel.id 
        ? { ...channel, membersList: updatedMembersList, members: updatedMembersList.length }
        : channel
    );
    
    setChannels(updatedChannels);
    setSelectedChannel({ ...selectedChannel, membersList: updatedMembersList, members: updatedMembersList.length });
    toast.success(`${user.name} a été ajouté au canal`);
    setShowAddMemberInput(false);
    setMemberSearchQuery("");
  };

  // Filtrer les utilisateurs disponibles
  const getAvailableUsers = () => {
    if (!selectedChannel) return [];
    const currentMemberIds = new Set(selectedChannel.membersList.map(m => m.id));
    return availableUsers.filter(user => 
      !currentMemberIds.has(user.id) &&
      (user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(memberSearchQuery.toLowerCase()))
    );
  };

  // Fonction pour ajouter un emoji
  const onEmojiClick = (emojiObject: any) => {
    setMessageInput(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  

  // Ajouter/retirer une réaction
  const handleReaction = (messageId: string, emoji: string) => {
    if (!selectedChannel) return;
    const channelMessages = [...(messages[selectedChannel.id] || [])];
    const msgIndex = channelMessages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const msg = { ...channelMessages[msgIndex] };
    const reactions = [...(msg.reactions || [])];
    const existingIndex = reactions.findIndex(r => r.emoji === emoji);

    if (existingIndex >= 0) {
      const r = { ...reactions[existingIndex] };
      if (r.userIds.includes("admin")) {
        r.userIds = r.userIds.filter(id => id !== "admin");
        r.count -= 1;
        if (r.count === 0) {
          reactions.splice(existingIndex, 1);
        } else {
          reactions[existingIndex] = r;
        }
      } else {
        r.userIds = [...r.userIds, "admin"];
        r.count += 1;
        reactions[existingIndex] = r;
      }
    } else {
      reactions.push({ emoji, count: 1, userIds: ["admin"] });
    }

    msg.reactions = reactions;
    channelMessages[msgIndex] = msg;
    setMessages({ ...messages, [selectedChannel.id]: channelMessages });
    setReactionPickerMessageId(null);
  };

  // Supprimer son propre message
  // Supprimer son propre message
const handleDeleteMessage = (messageId: string) => {
  if (!selectedChannel) return;
  const channelMessages = (messages[selectedChannel.id] || []).map(m =>
    m.id === messageId ? { 
      ...m, 
      deleted: true, 
      content: "Vous avez supprimé ce message", 
      attachments: undefined,
      reactions: [] // ← AJOUTER CETTE LIGNE pour faire disparaître les réactions
    } : m
  );
  setMessages({ ...messages, [selectedChannel.id]: channelMessages });
  setDeleteConfirmMessageId(null);
  toast.success("Message supprimé");
};

  

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId="1"
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
                            onClick={() => {
                              setSelectedChannel(channel);
                              setShowMembersPanel(false);
                              setShowAddMemberInput(false);
                            }}
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

          {/* Zone de chat principale */}
          {selectedChannel ? (
            <div className={`flex-1 flex transition-all duration-300 overflow-hidden`}>
              <div className="flex-1 flex flex-col bg-[#F7F8FC]">
                {/* En-tête du chat - VERSION MODIFIÉE */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${selectedChannel.color} flex items-center justify-center text-white`}>
                      {getChannelIcon(selectedChannel)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-[#1B2A4A]">{selectedChannel.name}</h2>
                      <p className="text-sm text-gray-500">{selectedChannel.description}</p>
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
                                    <Button variant="ghost" size="sm" onClick={() => setShowMembersPanel(!showMembersPanel)}>
                                      <Users className="w-4 h-4 mr-2" />
                                      {selectedChannel.membersList.length}
                                    </Button>
                                  </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {(messages[selectedChannel.id] || []).map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 group ${message.isAdmin ? 'flex-row-reverse' : ''}`}
                      
                    >
                      <Avatar className="w-8 h-8 shrink-0 mt-1">
                        <AvatarFallback className={message.isAdmin ? 'bg-[#0EA8A8] text-white' : 'bg-gray-200'}>
                          {message.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`flex-1 flex flex-col ${message.isAdmin ? 'items-end' : 'items-start'}`}>
                        {/* Nom + heure */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{message.senderName}</span>
                          <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                          {message.isAdmin && (
                            <Badge variant="outline" className="text-xs bg-[#0EA8A8]/10 text-[#0EA8A8]">Admin</Badge>
                          )}
                        </div>

                        {/* Citation de réponse */}
                        {message.replyTo && (
                          <div className={`mb-1 px-3 py-1.5 rounded-lg border-l-2 border-[#0EA8A8] bg-gray-100 max-w-[70%] text-left`}>
                            <p className="text-xs font-semibold text-[#0EA8A8]">{message.replyTo.senderName}</p>
                            <p className="text-xs text-gray-500 truncate">{message.replyTo.content}</p>
                          </div>
                        )}

                        {/* Bulle du message + actions flottantes */}
                        <div className={`relative flex items-center gap-2 ${message.isAdmin ? 'flex-row-reverse' : ''}`}>
                          {/* Bulle */}
                          <div className={`relative max-w-[70%] px-4 py-2 rounded-2xl  ${
                            message.deleted
                              ? 'bg-gray-100 border border-dashed border-gray-300 italic text-gray-400 text-sm'
                              : message.isAdmin
                                ? 'bg-[#0EA8A8] text-white'
                                : 'bg-white border border-gray-200'
                          }`}>
                            {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
                            {!message.deleted && message.attachments && message.attachments.length > 0 && (
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

                          {/* Actions flottantes (hover) */}
                          {!message.deleted  && (
                            <div className={`flex items-center   ${message.isAdmin ? 'flex-row-reverse' : ''}`}>
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
                                  <div className={`absolute bottom-9 ${message.isAdmin ? 'right-0' : 'left-0'} z-50 flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1`}>
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
                                onClick={() => setReplyTo(message)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-500"
                                title="Répondre"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {/* Supprimer (seulement ses propres messages) */}
                              {message.isAdmin && (
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

                        {/* Réactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.reactions.map(reaction => (
                              <button
                                key={reaction.emoji}
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                  reaction.userIds.includes("admin")
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
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie avec pièces jointes et emojis */}
                <div className="bg-white border-t border-gray-200 p-4">
                  {/* Bandeau réponse */}
                  {replyTo && (
                    <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-[#0EA8A8]/10 rounded-lg border border-[#0EA8A8]/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0EA8A8]">Répondre à {replyTo.senderName}</p>
                        <p className="text-xs text-gray-500 truncate">{replyTo.content || "(pièce jointe)"}</p>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                  
                  <div className="flex gap-2 relative">
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
                    Messages envoyés en tant qu'Admin - Vous pouvez joindre des fichiers (images, PDF, documents) ou ajouter des emojis
                  </p>
                </div>
              </div>

              {/* Panneau latéral des membres (style Messenger) */}
              {showMembersPanel && (
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
                  {/* En-tête du panneau */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowMembersPanel(false)}
                        className="lg:hidden"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <h3 className="font-semibold text-[#1B2A4A]">
                        Membres du canal
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAddMemberInput(!showAddMemberInput)}
                      className="text-[#0EA8A8] hover:text-[#0c8e8e] shrink-0"
                    >
                      <UserPlus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Zone de recherche d'ajout de membre */}
                  {showAddMemberInput && (
                    <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher un utilisateur..."
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                      <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                        {getAvailableUsers().map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                            onClick={() => handleAddMember(user)}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1B2A4A] truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[#0EA8A8] shrink-0">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {getAvailableUsers().length === 0 && memberSearchQuery && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            Aucun utilisateur trouvé
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Liste des membres - prend tout l'espace restant */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {selectedChannel.membersList.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="bg-[#0EA8A8]/10 text-[#0EA8A8]">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#1B2A4A] truncate">{member.name}</p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs shrink-0">
                                {member.role}
                              </Badge>
                              <span className="text-xs text-gray-400 truncate">
                                Depuis le {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member)}
                          className="text-gray-400 hover:text-red-500 shrink-0 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {selectedChannel.membersList.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Aucun membre dans ce canal
                      </div>
                    )}
                  </div>
                </div>
              )}
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

      {/* Dialogue de confirmation pour le retrait d'un membre */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#1B2A4A]">Confirmer le retrait</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Êtes-vous sûr de vouloir retirer <strong className="text-[#1B2A4A]">{memberToRemove?.name}</strong> de ce canal ?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Cette action est irréversible et le membre ne pourra plus voir les messages de ce canal.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={confirmRemoveMember}
                className="bg-red-500 hover:bg-red-600"
              >
                Retirer le membre
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}