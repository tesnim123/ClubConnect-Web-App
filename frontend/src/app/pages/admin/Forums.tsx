// pages/admin/Forums.tsx
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus,
  Globe,
  Building,
  Eye,
  ThumbsUp,
  MessageCircle,
  Pin,
  Lock,
  Clock,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Share2,
  Flag,
  Edit,
  Trash2,
  X,
  Send,
  Heart,
  HeartOff,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  Tags
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

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
  image?: string;
  tags?: string[];
}

// Données d'exemple pour les forums
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

// Données d'exemple pour les posts avec commentaires
const mockPosts: { [key: string]: Post[] } = {
  global_1: [
    {
      id: "post_1",
      title: "Bienvenue sur le forum général ! 🎉",
      content: "Ce forum est dédié à toutes les discussions concernant la vie universitaire. N'hésitez pas à partager vos idées, suggestions et à poser vos questions. Ensemble, faisons de cette plateforme un espace d'échange enrichissant !",
      author: "Admin",
      authorAvatar: "",
      authorRole: "Administrateur",
      createdAt: "2024-01-01T10:00:00",
      repliesCount: 25,
      likesCount: 48,
      comments: [
        {
          id: "comment_1",
          content: "Super initiative ! Hâte de voir la communauté grandir.",
          author: "Marie Martin",
          authorRole: "Staff",
          createdAt: "2024-01-01T11:30:00",
          likes: 12,
          isLiked: false,
          replies: [
            {
              id: "reply_1",
              content: "Merci Marie ! N'hésite pas à inviter tes amis.",
              author: "Admin",
              authorRole: "Administrateur",
              createdAt: "2024-01-01T12:00:00",
              likes: 5,
              isLiked: false
            }
          ]
        },
        {
          id: "comment_2",
          content: "Est-ce qu'on peut proposer des idées d'événements ici ?",
          author: "Pierre Durand",
          authorRole: "Membre",
          createdAt: "2024-01-02T09:15:00",
          likes: 8,
          isLiked: false
        }
      ],
      isLiked: false,
      isSaved: false,
      isPinned: true,
      isLocked: false,
      forumId: "global_1",
      tags: ["Bienvenue", "Communauté"]
    },
    {
      id: "post_2",
      title: "Proposition pour un événement inter-clubs",
      content: "Je propose d'organiser un événement qui rassemblerait tous les clubs de l'université. Quelque chose comme une journée portes ouvertes ou un festival des clubs. Qu'en pensez-vous ?",
      author: "Marie Martin",
      authorAvatar: "",
      authorRole: "Staff",
      createdAt: "2024-03-15T14:30:00",
      repliesCount: 12,
      likesCount: 28,
      comments: [
        {
          id: "comment_3",
          content: "Excellente idée ! Je suis partant pour aider.",
          author: "Jean Dupont",
          authorRole: "Staff",
          createdAt: "2024-03-15T15:45:00",
          likes: 15,
          isLiked: false
        },
        {
          id: "comment_4",
          content: "On pourrait faire ça en mai, pendant la semaine de l'innovation.",
          author: "Sophie Bernard",
          authorRole: "Membre",
          createdAt: "2024-03-16T10:20:00",
          likes: 10,
          isLiked: false
        }
      ],
      isLiked: false,
      isSaved: false,
      isPinned: false,
      isLocked: false,
      forumId: "global_1",
      tags: ["Événement", "Inter-clubs"]
    }
  ],
  club_1: [
    {
      id: "post_3",
      title: "🚀 Hackathon 2024 - Appel à participants !",
      content: "Le Club d'Informatique organise son hackathon annuel du 15 au 17 mai ! Thème : Innovation et IA. Inscrivez-vous vite, places limitées. Des prix à gagner !",
      author: "Jean Dupont",
      authorAvatar: "",
      authorRole: "Président",
      createdAt: "2024-03-10T09:00:00",
      repliesCount: 18,
      likesCount: 35,
      comments: [
        {
          id: "comment_5",
          content: "Je m'inscris ! Est-ce que les débutants sont acceptés ?",
          author: "Thomas Petit",
          authorRole: "Membre",
          createdAt: "2024-03-10T10:30:00",
          likes: 8,
          isLiked: false,
          replies: [
            {
              id: "reply_2",
              content: "Oui bien sûr ! Tous les niveaux sont acceptés. On aura des mentors pour aider.",
              author: "Jean Dupont",
              authorRole: "Président",
              createdAt: "2024-03-10T11:00:00",
              likes: 12,
              isLiked: false
            }
          ]
        },
        {
          id: "comment_6",
          content: "Super initiative ! Je partage avec mes amis.",
          author: "Claire Lefevre",
          authorRole: "Membre",
          createdAt: "2024-03-11T14:20:00",
          likes: 5,
          isLiked: false
        }
      ],
      isLiked: true,
      isSaved: false,
      isPinned: true,
      isLocked: false,
      forumId: "club_1",
      tags: ["Hackathon", "Programmation", "IA"],
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=300&fit=crop"
    }
  ]
};

export default function AdminForums() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'posts'>('list');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState<{ [key: string]: Post[] }>(mockPosts);
  const [newComment, setNewComment] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId?: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Catégories de forums
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
          toast.info("Vous n'aimez plus ce post");
        } else {
          post.likesCount++;
          post.isLiked = true;
          toast.success("Vous aimez ce post");
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
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: "Admin",
      authorRole: "Administrateur",
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
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
    toast.success("Commentaire ajouté");
  };

  const handleAddReply = (forumId: string, postId: string, commentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: Comment = {
      id: Date.now().toString(),
      content: replyContent,
      author: "Admin",
      authorRole: "Administrateur",
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPosts(prev => {
      const forumPosts = [...prev[forumId]];
      const postIndex = forumPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        const commentIndex = forumPosts[postIndex].comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          if (!forumPosts[postIndex].comments[commentIndex].replies) {
            forumPosts[postIndex].comments[commentIndex].replies = [];
          }
          forumPosts[postIndex].comments[commentIndex].replies!.push(newReply);
          forumPosts[postIndex].repliesCount++;
        }
        return { ...prev, [forumId]: forumPosts };
      }
      return prev;
    });

    setReplyContent("");
    setReplyingTo(null);
    toast.success("Réponse ajoutée");
  };

  const handleAddPost = (forumId: string) => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Veuillez remplir tous les champs");
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
      forumId: forumId
    };

    setPosts(prev => {
      const forumPosts = [newPost, ...(prev[forumId] || [])];
      return { ...prev, [forumId]: forumPosts };
    });

    setShowNewPostModal(false);
    setNewPostTitle("");
    setNewPostContent("");
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

  const handleReportPost = (postId: string) => {
    toast.info("Signalement envoyé à l'administrateur");
  };

  const CommentComponent = ({ 
    comment, 
    forumId, 
    postId, 
    depth = 0 
  }: { 
    comment: Comment; 
    forumId: string; 
    postId: string;
    depth?: number;
  }) => {
    const [showReply, setShowReply] = useState(false);
    const [localReply, setLocalReply] = useState("");

    const handleLocalReply = () => {
      if (!localReply.trim()) return;

      const newReply: Comment = {
        id: Date.now().toString(),
        content: localReply,
        author: "Admin",
        authorRole: "Administrateur",
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };

      setPosts(prev => {
        const forumPosts = [...prev[forumId]];
        const postIndex = forumPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          const commentIndex = forumPosts[postIndex].comments.findIndex(c => c.id === comment.id);
          if (commentIndex !== -1) {
            if (!forumPosts[postIndex].comments[commentIndex].replies) {
              forumPosts[postIndex].comments[commentIndex].replies = [];
            }
            forumPosts[postIndex].comments[commentIndex].replies!.push(newReply);
            forumPosts[postIndex].repliesCount++;
          }
          return { ...prev, [forumId]: forumPosts };
        }
        return prev;
      });

      setLocalReply("");
      setShowReply(false);
      toast.success("Réponse ajoutée");
    };

    return (
      <div className={`ml-${depth * 4} mt-3`}>
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {comment.author.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-[#1B2A4A]">{comment.author}</span>
                {comment.authorRole && (
                  <Badge variant="outline" className="text-xs">
                    {comment.authorRole}
                  </Badge>
                )}
                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleLikeComment(forumId, postId, comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0EA8A8] transition-colors"
                >
                  {comment.isLiked ? (
                    <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                  ) : (
                    <ThumbsUp className="w-3 h-3" />
                  )}
                  <span>{comment.likes}</span>
                </button>
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="text-xs text-gray-500 hover:text-[#0EA8A8] transition-colors"
                >
                  Répondre
                </button>
              </div>
            </div>
            {showReply && (
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Écrire une réponse..."
                  value={localReply}
                  onChange={(e) => setLocalReply(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button size="sm" onClick={handleLocalReply} className="bg-[#0EA8A8]">
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {comment.replies && comment.replies.map(reply => (
          <CommentComponent
            key={reply.id}
            comment={reply}
            forumId={forumId}
            postId={postId}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  };

  if (viewMode === 'posts' && selectedForum) {
    const forumPosts = posts[selectedForum.id] || [];
    const pinnedPosts = forumPosts.filter(p => p.isPinned);
    const regularPosts = forumPosts.filter(p => !p.isPinned);

    return (
      <div className="flex h-screen">
        <Sidebar role="admin" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav userName="Admin" userRole="Administrateur" notificationCount={7} />

          <main className="flex-1 overflow-y-auto bg-gray-100">
            {/* Bannière du forum */}
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
              {/* Header du forum */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Retour aux forums</span>
                </button>
                <Button onClick={() => setShowNewPostModal(true)} className="bg-[#0EA8A8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau sujet
                </Button>
              </div>

              {/* Statistiques */}
              <Card className="p-4 mb-6">
                <div className="flex items-center justify-between">
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
                </div>
              </Card>

              {/* Posts */}
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
                    onReport={() => handleReportPost(post.id)}
                    onAddComment={() => handleAddComment(selectedForum.id, post.id)}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onAddReply={(commentId: string, _reply: Comment) => handleAddReply(selectedForum.id, post.id, commentId)}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    CommentComponent={CommentComponent}
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
                    onReport={() => handleReportPost(post.id)}
                    onAddComment={() => handleAddComment(selectedForum.id, post.id)}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onAddReply={(commentId: string) => handleAddReply(selectedForum.id, post.id, commentId)}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    CommentComponent={CommentComponent}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Modal Nouveau Sujet */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1B2A4A]">Créer un nouveau sujet</h2>
                <button onClick={() => setShowNewPostModal(false)}>
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
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewPostModal(false)}>
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
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Forums</h1>
                  <p className="text-gray-600">Discutez avec la communauté</p>
                </div>
              </div>

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

// Composant PostCard
function PostCard({ 
  post, 
  forumId, 
  onLike, 
  onSave, 
  onDelete, 
  onPin, 
  onReport,
  onAddComment,
  newComment,
  setNewComment,
  onAddReply,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  CommentComponent
}: any) {
  const [showComments, setShowComments] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {/* En-tête du post */}
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
                {formatDate(post.createdAt)}
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
              <DropdownMenuItem onClick={onReport}>
                <Flag className="w-4 h-4 mr-2" />
                Signaler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contenu du post */}
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>
        
        {post.image && (
          <img src={post.image} alt={post.title} className="w-full rounded-lg mb-3 max-h-80 object-cover" />
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mb-3">
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
            <span>{post.comments.length} commentaires</span>
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
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={onAddComment} className="bg-[#0EA8A8]">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Liste des commentaires */}
            <div className="space-y-3">
              {post.comments.map((comment: any) => (
                <CommentComponent
                  key={comment.id}
                  comment={comment}
                  forumId={forumId}
                  postId={post.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function formatDate(dateString: string) {
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
}