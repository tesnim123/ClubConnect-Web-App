// pages/admin/Forums.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus,
  Globe,
  Building,
  ThumbsUp,
  MessageCircle,
  Pin,
  Clock,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Flag,
  Trash2,
  X,
  Send,
  Heart,
  Bookmark,
  BookmarkCheck,
  Upload,
  File,
  UserPlus,
  UserMinus,
  UserCheck,
  Settings,
  Download,
  Image as ImageIcon,
  FileText,
  FileArchive,
  Film,
  Music,
  ExternalLink,
  ZoomIn,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

// Types
interface Forum {
  id: string;
  name: string;
  description: string;
  type: 'global' | 'club';
  clubId?: string;
  clubName?: string;
  postCount: number;
  memberCount: number;
  lastActivity: string;
  isActive: boolean;
  isPinned?: boolean;
  coverImage?: string;
}

interface ForumMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  isActive: boolean;
}

interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  attachments?: Attachment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  createdAt: string;
  updatedAt?: string;
  repliesCount: number;
  likesCount: number;
  comments: Comment[];
  isLiked: boolean;
  isSaved: boolean;
  isPinned: boolean;
  isLocked: boolean;
  forumId: string;
  attachments?: Attachment[];
  tags?: string[];
}

// Lightbox Component
function Lightbox({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="w-8 h-8" />
      </button>
      
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 z-10"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </>
      )}
      
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
      
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// Composant d'affichage des pièces jointes (style Facebook)
function AttachmentGallery({ attachments, onDelete, canDelete = false }: { 
  attachments: Attachment[], 
  onDelete?: (id: string) => void,
  canDelete?: boolean 
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const images = attachments.filter(a => a.type === 'image');
  const files = attachments.filter(a => a.type === 'file');

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return <FileArchive className="w-8 h-8 text-yellow-500" />;
    if (ext === 'mp4' || ext === 'mov' || ext === 'avi') return <Film className="w-8 h-8 text-purple-500" />;
    if (ext === 'mp3' || ext === 'wav') return <Music className="w-8 h-8 text-green-500" />;
    return <File className="w-8 h-8 text-blue-500" />;
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success(`Téléchargement de ${fileName} démarré`);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <>
      {/* Images - Grille style Facebook */}
      {images.length > 0 && (
        <div className={`grid gap-1 mt-3 rounded-lg overflow-hidden ${
          images.length === 1 ? 'grid-cols-1' :
          images.length === 2 ? 'grid-cols-2' :
          images.length === 3 ? 'grid-cols-2' :
          images.length === 4 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={img.id}
              className="relative group cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-48 object-cover hover:opacity-95 transition-opacity"
              />
              {canDelete && onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fichiers - Liste style Facebook */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                {getFileIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  {file.size && (
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(file.url, file.name)}
                  className="p-2 text-gray-500 hover:text-[#0EA8A8] rounded-full hover:bg-gray-200 transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images.map(img => img.url)}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// Données d'exemple
const mockForums: Forum[] = [
  {
    id: "global_1",
    name: "Forum Général",
    description: "Discussions générales sur la vie universitaire et les événements",
    type: "global",
    postCount: 156,
    memberCount: 450,
    lastActivity: "2024-03-20T10:30:00",
    isActive: true,
    isPinned: true,
    coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=200&fit=crop"
  },
  {
    id: "club_1",
    name: "Club d'Informatique",
    description: "Forum du Club d'Informatique - Discussions techniques, projets et événements",
    type: "club",
    clubId: "club1",
    clubName: "Club d'Informatique",
    postCount: 89,
    memberCount: 120,
    lastActivity: "2024-03-19T15:20:00",
    isActive: true,
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=200&fit=crop"
  },
  {
    id: "club_2",
    name: "Club Sportif",
    description: "Forum du Club Sportif - Annonces, matchs et entraînements",
    type: "club",
    clubId: "club2",
    clubName: "Club Sportif",
    postCount: 67,
    memberCount: 95,
    lastActivity: "2024-03-18T09:45:00",
    isActive: true,
    coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=200&fit=crop"
  }
];

const mockMembers: { [key: string]: ForumMember[] } = {
  global_1: [
    { id: "1", name: "Admin", email: "admin@univ.com", role: "admin", joinedAt: "2024-01-01", isActive: true },
    { id: "2", name: "Marie Martin", email: "marie@univ.com", role: "moderator", joinedAt: "2024-01-02", isActive: true },
    { id: "3", name: "Pierre Durand", email: "pierre@univ.com", role: "member", joinedAt: "2024-01-05", isActive: true },
    { id: "4", name: "Sophie Bernard", email: "sophie@univ.com", role: "member", joinedAt: "2024-01-10", isActive: true },
  ],
  club_1: [
    { id: "1", name: "Admin", email: "admin@univ.com", role: "admin", joinedAt: "2024-01-01", isActive: true },
    { id: "2", name: "Jean Dupont", email: "jean@club.com", role: "moderator", joinedAt: "2024-01-02", isActive: true },
    { id: "3", name: "Thomas Petit", email: "thomas@club.com", role: "member", joinedAt: "2024-01-05", isActive: true },
  ],
  club_2: [
    { id: "1", name: "Admin", email: "admin@univ.com", role: "admin", joinedAt: "2024-01-01", isActive: true },
    { id: "2", name: "Claire Lefevre", email: "claire@sport.com", role: "moderator", joinedAt: "2024-01-02", isActive: true },
  ]
};

const mockPosts: { [key: string]: Post[] } = {
  global_1: [
    {
      id: "post_1",
      title: "Bienvenue sur le forum général ! 🎉",
      content: "Ce forum est dédié à toutes les discussions concernant la vie universitaire. N'hésitez pas à partager vos idées.",
      author: "Admin",
      authorRole: "Administrateur",
      createdAt: "2024-01-01T10:00:00",
      repliesCount: 25,
      likesCount: 48,
      comments: [],
      isLiked: false,
      isSaved: false,
      isPinned: true,
      isLocked: false,
      forumId: "global_1",
      tags: ["Bienvenue", "Communauté"],
      attachments: [
        {
          id: "att1",
          type: "image",
          url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600",
          name: "campus.jpg"
        },
        {
          id: "att2",
          type: "image",
          url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600",
          name: "students.jpg"
        }
      ]
    }
  ],
  club_1: [
    {
      id: "post_3",
      title: "🚀 Hackathon 2024",
      content: "Le Club d'Informatique organise son hackathon annuel !",
      author: "Jean Dupont",
      authorRole: "Président",
      createdAt: "2024-03-10T09:00:00",
      repliesCount: 18,
      likesCount: 35,
      comments: [],
      isLiked: true,
      isSaved: false,
      isPinned: true,
      isLocked: false,
      forumId: "club_1",
      tags: ["Hackathon", "IA"],
      attachments: [
        {
          id: "att3",
          type: "image",
          url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600",
          name: "hackathon.jpg"
        },
        {
          id: "att4",
          type: "file",
          url: "#",
          name: "reglement-hackathon.pdf",
          size: 2500000
        }
      ]
    }
  ]
};

export default function AdminForums() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'posts' | 'members'>('list');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState<{ [key: string]: Post[] }>(mockPosts);
  const [members, setMembers] = useState<{ [key: string]: ForumMember[] }>(mockMembers);
  const [newComment, setNewComment] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [postAttachments, setPostAttachments] = useState<Attachment[]>([]);
  const [commentAttachments, setCommentAttachments] = useState<Attachment[]>([]);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'moderator' | 'member'>('member');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  const forumCategories = [
    { id: "global", name: "Forums Généraux", forums: mockForums.filter(f => f.type === 'global') },
    { id: "clubs", name: "Forums des Clubs", forums: mockForums.filter(f => f.type === 'club') }
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

  const handleForumClick = (forum: Forum) => {
    setSelectedForum(forum);
    setViewMode('posts');
  };

  const handleBackToList = () => {
    setSelectedForum(null);
    setViewMode('list');
  };

  const handleManageMembers = () => {
    setViewMode('members');
  };

  const handleBackToPosts = () => {
    setViewMode('posts');
  };

  const handleFileUpload = (files: FileList | null, type: 'post' | 'comment') => {
    if (!files) return;
    
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      mimeType: file.type
    }));
    
    if (type === 'post') {
      setPostAttachments(prev => [...prev, ...newAttachments]);
    } else {
      setCommentAttachments(prev => [...prev, ...newAttachments]);
    }
    
    toast.success(`${newAttachments.length} fichier(s) ajouté(s)`);
  };

  const removeAttachment = (attachmentId: string, type: 'post' | 'comment') => {
    if (type === 'post') {
      setPostAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } else {
      setCommentAttachments(prev => prev.filter(a => a.id !== attachmentId));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getForumIcon = (type: string) => {
    return type === 'global' ? <Globe className="w-5 h-5" /> : <Building className="w-5 h-5" />;
  };

  const handleLikePost = (forumId: string, postId: string) => {
    setPosts(prev => {
      const forumPosts = [...prev[forumId]];
      const postIndex = forumPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        const post = forumPosts[postIndex];
        if (post.isLiked) {
          post.likesCount--;
          post.isLiked = false;
        } else {
          post.likesCount++;
          post.isLiked = true;
        }
        forumPosts[postIndex] = post;
        return { ...prev, [forumId]: forumPosts };
      }
      return prev;
    });
  };

  const handleLikeComment = (forumId: string, postId: string, commentId: string) => {
    setPosts(prev => {
      const forumPosts = [...prev[forumId]];
      const postIndex = forumPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        const post = forumPosts[postIndex];
        const commentIndex = post.comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          const comment = post.comments[commentIndex];
          if (comment.isLiked) {
            comment.likes--;
            comment.isLiked = false;
          } else {
            comment.likes++;
            comment.isLiked = true;
          }
          post.comments[commentIndex] = comment;
          forumPosts[postIndex] = post;
          return { ...prev, [forumId]: forumPosts };
        }
      }
      return prev;
    });
  };

  const handleSavePost = (forumId: string, postId: string) => {
    setPosts(prev => {
      const forumPosts = [...prev[forumId]];
      const postIndex = forumPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        const post = forumPosts[postIndex];
        post.isSaved = !post.isSaved;
        toast.success(post.isSaved ? "Post sauvegardé" : "Post retiré des sauvegardes");
        forumPosts[postIndex] = post;
        return { ...prev, [forumId]: forumPosts };
      }
      return prev;
    });
  };

  const handleAddComment = (forumId: string, postId: string) => {
    if (!newComment.trim() && commentAttachments.length === 0) {
      toast.error("Veuillez écrire un message ou ajouter un fichier");
      return;
    }

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: "Admin",
      authorRole: "Administrateur",
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      attachments: commentAttachments.length > 0 ? [...commentAttachments] : undefined
    };

    setPosts(prev => {
      const forumPosts = [...prev[forumId]];
      const postIndex = forumPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        forumPosts[postIndex].comments.push(newCommentObj);
        forumPosts[postIndex].repliesCount++;
        return { ...prev, [forumId]: forumPosts };
      }
      return prev;
    });

    setNewComment("");
    setCommentAttachments([]);
    toast.success("Commentaire ajouté");
  };

  const handleAddPost = (forumId: string) => {
    if (!newPostTitle.trim() || (!newPostContent.trim() && postAttachments.length === 0)) {
      toast.error("Veuillez remplir tous les champs ou ajouter un fichier");
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: "Admin",
      authorRole: "Administrateur",
      createdAt: new Date().toISOString(),
      repliesCount: 0,
      likesCount: 0,
      comments: [],
      isLiked: false,
      isSaved: false,
      isPinned: false,
      isLocked: false,
      forumId: forumId,
      attachments: postAttachments.length > 0 ? [...postAttachments] : undefined
    };

    setPosts(prev => {
      const forumPosts = [newPost, ...(prev[forumId] || [])];
      return { ...prev, [forumId]: forumPosts };
    });

    setShowNewPostModal(false);
    setNewPostTitle("");
    setNewPostContent("");
    setPostAttachments([]);
    toast.success("Nouveau sujet créé");
  };

  const handleDeletePost = (forumId: string, postId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sujet ?")) {
      setPosts(prev => {
        const forumPosts = prev[forumId].filter(p => p.id !== postId);
        return { ...prev, [forumId]: forumPosts };
      });
      toast.success("Sujet supprimé");
    }
  };

  const handlePinPost = (forumId: string, postId: string) => {
    setPosts(prev => {
      const forumPosts = [...prev[forumId]];
      const postIndex = forumPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        forumPosts[postIndex].isPinned = !forumPosts[postIndex].isPinned;
        toast.success(forumPosts[postIndex].isPinned ? "Sujet épinglé" : "Sujet désépinglé");
        return { ...prev, [forumId]: forumPosts };
      }
      return prev;
    });
  };

  // Gestion des membres
  const handleAddMember = () => {
    if (!newMemberEmail.trim()) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    if (!selectedForum) return;

    const newMember: ForumMember = {
      id: Date.now().toString(),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      joinedAt: new Date().toISOString(),
      isActive: true
    };

    setMembers(prev => ({
      ...prev,
      [selectedForum.id]: [...(prev[selectedForum.id] || []), newMember]
    }));

    setSelectedForum(prev => prev ? {
      ...prev,
      memberCount: prev.memberCount + 1
    } : null);

    setNewMemberEmail("");
    setShowMemberDialog(false);
    toast.success(`${newMember.name} a été ajouté au forum`);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!selectedForum) return;
    
    setMembers(prev => ({
      ...prev,
      [selectedForum.id]: prev[selectedForum.id].filter(m => m.id !== memberId)
    }));

    setSelectedForum(prev => prev ? {
      ...prev,
      memberCount: prev.memberCount - 1
    } : null);

    toast.success(`${memberName} a été retiré du forum`);
  };

  const handleChangeMemberRole = (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    if (!selectedForum) return;

    setMembers(prev => ({
      ...prev,
      [selectedForum.id]: prev[selectedForum.id].map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      )
    }));

    toast.success("Rôle modifié avec succès");
  };

  // Vue de gestion des membres
  if (viewMode === 'members' && selectedForum) {
    const forumMembers = members[selectedForum.id] || [];
    const admins = forumMembers.filter(m => m.role === 'admin');
    const moderators = forumMembers.filter(m => m.role === 'moderator');
    const regularMembers = forumMembers.filter(m => m.role === 'member');

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

          <main className="flex-1 overflow-y-auto bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <button
                    onClick={handleBackToPosts}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors mb-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    <span>Retour au forum</span>
                  </button>
                  <h1 className="text-2xl font-bold text-[#1B2A4A]">Gestion des membres</h1>
                  <p className="text-gray-600">{selectedForum.name}</p>
                </div>
                <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0EA8A8]">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter un membre
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un membre au forum</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                          placeholder="email@exemple.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                        <Select value={newMemberRole} onValueChange={(v: any) => setNewMemberRole(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Membre</SelectItem>
                            <SelectItem value="moderator">Modérateur</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowMemberDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleAddMember} className="bg-[#0EA8A8]">
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Total: {forumMembers.length} membres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Administrateurs: {admins.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Modérateurs: {moderators.length}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                {admins.length > 0 && (
                  <Card>
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h2 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        Administrateurs
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {admins.map(member => (
                        <MemberRow
                          key={member.id}
                          member={member}
                          onRemove={() => handleRemoveMember(member.id, member.name)}
                          onChangeRole={(role) => handleChangeMemberRole(member.id, role)}
                          isCurrentUser={member.name === "Admin"}
                        />
                      ))}
                    </div>
                  </Card>
                )}

                {moderators.length > 0 && (
                  <Card>
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h2 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-500" />
                        Modérateurs
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {moderators.map(member => (
                        <MemberRow
                          key={member.id}
                          member={member}
                          onRemove={() => handleRemoveMember(member.id, member.name)}
                          onChangeRole={(role) => handleChangeMemberRole(member.id, role)}
                          isCurrentUser={member.name === "Admin"}
                        />
                      ))}
                    </div>
                  </Card>
                )}

                {regularMembers.length > 0 && (
                  <Card>
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h2 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        Membres
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {regularMembers.map(member => (
                        <MemberRow
                          key={member.id}
                          member={member}
                          onRemove={() => handleRemoveMember(member.id, member.name)}
                          onChangeRole={(role) => handleChangeMemberRole(member.id, role)}
                          isCurrentUser={member.name === "Admin"}
                        />
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Vue des posts
  if (viewMode === 'posts' && selectedForum) {
    const forumPosts = posts[selectedForum.id] || [];
    const pinnedPosts = forumPosts.filter(p => p.isPinned);
    const regularPosts = forumPosts.filter(p => !p.isPinned);

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

          <main className="flex-1 overflow-y-auto bg-gray-100">
            {selectedForum.coverImage && (
              <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${selectedForum.coverImage})` }}>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-4 left-6 text-white">
                  <h1 className="text-2xl font-bold">{selectedForum.name}</h1>
                  <p className="text-sm opacity-90">{selectedForum.description}</p>
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    <span>Retour aux forums</span>
                  </button>
                  <Button 
                    variant="outline" 
                    onClick={handleManageMembers}
                    className="ml-2"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gérer les membres
                  </Button>
                </div>
                <Button onClick={() => setShowNewPostModal(true)} className="bg-[#0EA8A8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau sujet
                </Button>
              </div>

              <Card className="p-4 mb-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{forumPosts.length} sujets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedForum.memberCount} membres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Dernière activité: {formatDate(selectedForum.lastActivity)}</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                {pinnedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    forumId={selectedForum.id}
                    onLike={() => handleLikePost(selectedForum.id, post.id)}
                    onSave={() => handleSavePost(selectedForum.id, post.id)}
                    onDelete={() => handleDeletePost(selectedForum.id, post.id)}
                    onPin={() => handlePinPost(selectedForum.id, post.id)}
                    onAddComment={() => handleAddComment(selectedForum.id, post.id)}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    commentAttachments={commentAttachments}
                    setCommentAttachments={setCommentAttachments}
                    onFileUpload={handleFileUpload}
                    commentFileInputRef={commentFileInputRef}
                    AttachmentGallery={AttachmentGallery}
                    removeAttachment={removeAttachment}
                  />
                ))}
                {regularPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    forumId={selectedForum.id}
                    onLike={() => handleLikePost(selectedForum.id, post.id)}
                    onSave={() => handleSavePost(selectedForum.id, post.id)}
                    onDelete={() => handleDeletePost(selectedForum.id, post.id)}
                    onPin={() => handlePinPost(selectedForum.id, post.id)}
                    onAddComment={() => handleAddComment(selectedForum.id, post.id)}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    commentAttachments={commentAttachments}
                    setCommentAttachments={setCommentAttachments}
                    onFileUpload={handleFileUpload}
                    commentFileInputRef={commentFileInputRef}
                    AttachmentGallery={AttachmentGallery}
                    removeAttachment={removeAttachment}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Modal Nouveau Sujet */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1B2A4A]">Créer un nouveau sujet</h2>
                <button onClick={() => {
                  setShowNewPostModal(false);
                  setPostAttachments([]);
                  setNewPostTitle("");
                  setNewPostContent("");
                }}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <Input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Titre de votre sujet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8]"
                    placeholder="Écrivez votre message..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pièces jointes</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#0EA8A8] transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Cliquez pour ajouter des images ou fichiers</p>
                    <p className="text-xs text-gray-400">JPG, PNG, PDF, DOC... (Max 10MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'post')}
                  />
                  <AttachmentGallery 
                    attachments={postAttachments} 
                    onDelete={(id) => removeAttachment(id, 'post')}
                    canDelete={true}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowNewPostModal(false);
                    setPostAttachments([]);
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={() => handleAddPost(selectedForum!.id)} className="bg-[#0EA8A8]">
                    Publier
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Vue liste des forums
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
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Forums</h1>
              <p className="text-gray-600">Discutez avec la communauté</p>

              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un forum..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-6">
              {forumCategories.map((category) => {
                const filteredForums = category.forums.filter(forum =>
                  forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  forum.description.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredForums.length === 0) return null;

                const isCollapsed = collapsedCategories.has(category.id);

                return (
                  <Card key={category.id} className="overflow-hidden">
                    <div 
                      className="bg-white px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-[#1B2A4A]">{category.name}</h2>
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-100">
                        {filteredForums.map((forum) => (
                          <div
                            key={forum.id}
                            onClick={() => handleForumClick(forum)}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                forum.type === 'global' 
                                  ? 'bg-purple-100 text-purple-600' 
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {getForumIcon(forum.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-[#1B2A4A]">{forum.name}</h3>
                                  {forum.isPinned && (
                                    <Pin className="w-3 h-3 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{forum.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    {forum.postCount} sujets
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {forum.memberCount} membres
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Actif {formatDate(forum.lastActivity)}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Composant MemberRow
function MemberRow({ member, onRemove, onChangeRole, isCurrentUser }: { 
  member: ForumMember, 
  onRemove: () => void, 
  onChangeRole: (role: 'admin' | 'moderator' | 'member') => void,
  isCurrentUser: boolean 
}) {
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-green-100 text-green-700';
      case 'moderator': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'moderator': return 'Modérateur';
      default: return 'Membre';
    }
  };

  return (
    <>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-[#0EA8A8] text-white">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1B2A4A]">{member.name}</span>
              {isCurrentUser && (
                <Badge variant="secondary" className="text-xs">Vous</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{member.email}</p>
            <p className="text-xs text-gray-400">Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
       
<div className="flex items-center gap-2">
  <Badge className={getRoleBadgeColor(member.role)}>
    {getRoleLabel(member.role)}
  </Badge>
  
  {!isCurrentUser && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowConfirmRemove(true)}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <UserMinus className="w-4 h-4 mr-1" />
      Retirer
    </Button>
  )}
</div>
      </div>

      {/* Dialog de confirmation de retrait */}
      <AlertDialog open={showConfirmRemove} onOpenChange={setShowConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-red-500" />
              Retirer le membre
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer{" "}
              <span className="font-semibold text-[#1B2A4A]">{member.name}</span>{" "}
              de ce forum ? Cette action est réversible, vous pourrez le rajouter ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmRemove(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmRemove(false);
                onRemove();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Composant PostCard
function PostCard({ 
  post, 
  forumId, 
  onLike, 
  onSave, 
  onDelete, 
  onPin, 
  onAddComment,
  newComment,
  setNewComment,
  replyContent,
  setReplyContent,
  commentAttachments,
  setCommentAttachments,
  onFileUpload,
  commentFileInputRef,
  AttachmentGallery,
  removeAttachment
}: any) {
  const [showComments, setShowComments] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = (commentId: string) => {
    if (!replyText.trim()) return;
    // Logique pour ajouter la réponse
    setReplyText("");
    setShowReplyInput(null);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-[#0EA8A8] text-white">
                {post.author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1B2A4A]">{post.author}</span>
                {post.authorRole && (
                  <Badge variant="outline" className="text-xs">{post.authorRole}</Badge>
                )}
                {post.isPinned && (
                  <Pin className="w-3 h-3 text-yellow-500" />
                )}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                {post.updatedAt && ` · Modifié`}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPin}>
                <Pin className="w-4 h-4 mr-2" />
                {post.isPinned ? "Désépingler" : "Épingler"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSave}>
                {post.isSaved ? (
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                {post.isSaved ? "Sauvegardé" : "Sauvegarder"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contenu */}
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>
        
        {/* Galerie d'images/fichiers */}
        {post.attachments && post.attachments.length > 0 && (
          <AttachmentGallery attachments={post.attachments} canDelete={false} />
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mb-3 mt-3">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <button
            onClick={onLike}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0EA8A8] transition-colors"
          >
            {post.isLiked ? (
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span>{post.likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0EA8A8] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments?.length || 0} commentaires</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0EA8A8] transition-colors"
          >
            {post.isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Commentaires */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Ajouter un commentaire */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Écrire un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => commentFileInputRef?.current?.click()} variant="outline">
                  <Upload className="w-4 h-4" />
                </Button>
                <Button onClick={onAddComment} className="bg-[#0EA8A8]">
                  <Send className="w-4 h-4" />
                </Button>
                <input
                  ref={commentFileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => onFileUpload(e.target.files, 'comment')}
                />
              </div>
              {commentAttachments && commentAttachments.length > 0 && (
                <div className="mt-2">
                  <AttachmentGallery 
                    attachments={commentAttachments} 
                    onDelete={(id: any) => removeAttachment(id, 'comment')}
                    canDelete={true}
                  />
                </div>
              )}
            </div>

            {/* Liste des commentaires simplifiée */}
            {post.comments?.map((comment: any) => (
              <div key={comment.id} className="flex gap-3 mt-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    {comment.author?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#1B2A4A]">{comment.author}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    {comment.attachments && (
                      <AttachmentGallery attachments={comment.attachments} canDelete={false} />
                    )}
                  </div>
                  {showReplyInput === comment.id && (
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Votre réponse..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 text-sm"
                      />
                      <Button size="sm" onClick={() => handleSubmitReply(comment.id)} className="bg-[#0EA8A8]">
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}