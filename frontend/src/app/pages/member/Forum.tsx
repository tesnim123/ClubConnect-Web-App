// pages/member/Forum.tsx
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { 
  Search, 
  Plus, 
  ThumbsUp, 
  MessageCircle, 
  Pin, 
  File, 
  X, 
  Send,
  Bookmark,
  BookmarkCheck,
  Share2,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  Users,
  ChevronRight,
  Lock,
  Globe,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  timestamp: string;
  likes: number;
  commentCount: number;
  shareCount: number;
  isPinned: boolean;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  images?: string[];
  comments: Comment[];
  clubId: string;
  clubName: string;
}

interface ClubForum {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  joined: boolean;
  joinDate?: string;
  coverImage?: string;
  color: string;
}

// Clubs auxquels le membre appartient
const memberClubs = [
  {
    id: "club1",
    name: "Club d'Informatique",
    description: "Discussions techniques, projets et actualités sur l'informatique",
    memberCount: 128,
    postCount: 245,
    joined: true,
    joinDate: "2024-01-15",
    color: "from-[#0EA8A8] to-[#1B2A4A]"
  },
  {
    id: "club3",
    name: "Club Artistique",
    description: "Créations artistiques, expositions et ateliers",
    memberCount: 78,
    postCount: 134,
    joined: true,
    joinDate: "2024-02-01",
    color: "from-purple-500 to-purple-700"
  }
];

// Forums disponibles pour rejoindre
const availableForums = [
  {
    id: "club2",
    name: "Club Sportif",
    description: "Matchs, entraînements et compétitions sportives",
    memberCount: 95,
    postCount: 167,
    joined: false,
    color: "from-blue-500 to-blue-700"
  },
  {
    id: "club4",
    name: "Club Écologie",
    description: "Actions écologiques, sensibilisation et projets verts",
    memberCount: 54,
    postCount: 89,
    joined: false,
    color: "from-green-500 to-green-700"
  },
  {
    id: "club5",
    name: "Club Lecture",
    description: "Partage de lectures, clubs de lecture et critiques",
    memberCount: 42,
    postCount: 76,
    joined: false,
    color: "from-yellow-500 to-yellow-700"
  }
];

// Données d'exemple pour les posts
const generateMockPosts = (clubId: string, clubName: string): Post[] => {
  if (clubId === "club1") {
    return [
      {
        id: "1",
        title: "🚀 Hackathon 2024 - Inscriptions ouvertes !",
        content: "Le Club d'Informatique organise son hackathon annuel du 15 au 17 mai ! Thème : Innovation et IA. Inscrivez-vous vite, places limitées.",
        authorName: "Jean Dupont",
        authorAvatar: "",
        authorRole: "Président",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        likes: 48,
        commentCount: 15,
        shareCount: 12,
        isPinned: true,
        isLiked: false,
        isSaved: false,
        tags: ["Hackathon", "Programmation", "IA"],
        images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop"],
        comments: [],
        clubId: clubId,
        clubName: clubName
      },
      {
        id: "2",
        title: "Partage de ressources pour apprendre React",
        content: "Salut à tous ! Je viens de terminer une formation sur React et je partage mes notes et ressources.",
        authorName: "Thomas Petit",
        authorAvatar: "",
        authorRole: "Membre",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        likes: 32,
        commentCount: 8,
        shareCount: 5,
        isPinned: false,
        isLiked: false,
        isSaved: false,
        tags: ["React", "Ressources"],
        comments: [],
        clubId: clubId,
        clubName: clubName
      }
    ];
  } else {
    return [
      {
        id: "3",
        title: "Exposition de peinture - Vernissage",
        content: "Venez découvrir les œuvres de nos artistes ce weekend !",
        authorName: "Sophie Bernard",
        authorAvatar: "",
        authorRole: "Présidente",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        likes: 56,
        commentCount: 12,
        shareCount: 8,
        isPinned: true,
        isLiked: false,
        isSaved: false,
        tags: ["Exposition", "Peinture", "Art"],
        images: ["https://images.unsplash.com/photo-1515187029135-8ee3e6d3c2e5?w=600&h=400&fit=crop"],
        comments: [],
        clubId: clubId,
        clubName: clubName
      }
    ];
  }
};

export default function MemberForum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<ClubForum | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedForumToJoin, setSelectedForumToJoin] = useState<ClubForum | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId?: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [memberForums, setMemberForums] = useState<ClubForum[]>(memberClubs);
  const [availableForumsList, setAvailableForumsList] = useState<ClubForum[]>(availableForums);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const memberData = {
    id: currentUser.id,
    fullName: `${currentUser.firstName} ${currentUser.lastName}`,
    role: "member",
    roleLabel: "Membre",
    avatar: currentUser.avatar,
    clubId: currentUser.clubId,
    clubName: currentUser.clubName
  };

  // Charger les posts du club sélectionné
  useEffect(() => {
    if (selectedClub) {
      setPosts(generateMockPosts(selectedClub.id, selectedClub.name));
    }
  }, [selectedClub]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleJoinForum = () => {
    if (selectedForumToJoin) {
      // Ajouter le forum aux forums du membre
      const newForum = { ...selectedForumToJoin, joined: true, joinDate: new Date().toISOString() };
      setMemberForums([...memberForums, newForum]);
      // Retirer des forums disponibles
      setAvailableForumsList(availableForumsList.filter(f => f.id !== selectedForumToJoin.id));
      setIsJoinModalOpen(false);
      setSelectedForumToJoin(null);
      toast.success(`Vous avez rejoint le forum ${selectedForumToJoin.name} !`);
    }
  };

  const handleSelectForum = (forum: ClubForum) => {
    if (forum.joined) {
      setSelectedClub(forum);
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const handleSavePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
    const post = posts.find(p => p.id === postId);
    toast.success(post?.isSaved ? "Post retiré des sauvegardes" : "Post sauvegardé");
  };

  const handleSharePost = (post: Post) => {
    setSelectedPost(post);
    setShareMessage("");
    setIsShareModalOpen(true);
  };

  const handleConfirmShare = () => {
    if (selectedPost) {
      toast.success("Post partagé avec succès !");
      setIsShareModalOpen(false);
    }
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const updateComments = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                };
              }
              if (comment.replies) {
                return { ...comment, replies: updateComments(comment.replies) };
              }
              return comment;
            });
          };
          return { ...post, comments: updateComments(post.comments) };
        }
        return post;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: memberData.fullName,
      authorAvatar: memberData.avatar,
      authorRole: memberData.roleLabel,
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, newCommentObj],
              commentCount: post.commentCount + 1
            }
          : post
      )
    );

    setNewComment("");
    toast.success("Commentaire ajouté");
  };

  const handleAddReply = (postId: string, commentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: Comment = {
      id: Date.now().toString(),
      author: memberData.fullName,
      authorAvatar: memberData.avatar,
      authorRole: memberData.roleLabel,
      content: replyContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const addReplyToComment = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newReply]
                };
              }
              if (comment.replies) {
                return { ...comment, replies: addReplyToComment(comment.replies) };
              }
              return comment;
            });
          };
          return {
            ...post,
            comments: addReplyToComment(post.comments),
            commentCount: post.commentCount + 1
          };
        }
        return post;
      })
    );

    setReplyContent("");
    setReplyingTo(null);
    toast.success("Réponse ajoutée");
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error("Veuillez écrire quelque chose");
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostContent.split('\n')[0].slice(0, 60),
      content: newPostContent,
      authorName: memberData.fullName,
      authorAvatar: memberData.avatar,
      authorRole: memberData.roleLabel,
      timestamp: new Date().toISOString(),
      likes: 0,
      commentCount: 0,
      shareCount: 0,
      isPinned: false,
      isLiked: false,
      isSaved: false,
      tags: [],
      images: newPostImages,
      comments: [],
      clubId: selectedClub!.id,
      clubName: selectedClub!.name
    };

    setPosts([newPost, ...posts]);
    setIsPostModalOpen(false);
    setNewPostContent("");
    setNewPostImages([]);
    toast.success("Post publié avec succès");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
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
    return format(date, 'dd MMM yyyy', { locale: fr });
  };

  const CommentComponent = ({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) => {
    const [showReply, setShowReply] = useState(false);
    const [localReply, setLocalReply] = useState("");

    const handleLocalReply = () => {
      if (!localReply.trim()) return;

      const newReply: Comment = {
        id: Date.now().toString(),
        author: memberData.fullName,
        authorAvatar: memberData.avatar,
        authorRole: memberData.roleLabel,
        content: localReply,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };

      setPosts(prev =>
        prev.map(post => {
          if (post.id === postId) {
            const addReplyToComment = (comments: Comment[]): Comment[] => {
              return comments.map(c => {
                if (c.id === comment.id) {
                  return {
                    ...c,
                    replies: [...(c.replies || []), newReply]
                  };
                }
                if (c.replies) {
                  return { ...c, replies: addReplyToComment(c.replies) };
                }
                return c;
              });
            };
            return {
              ...post,
              comments: addReplyToComment(post.comments),
              commentCount: post.commentCount + 1
            };
          }
          return post;
        })
      );

      setLocalReply("");
      setShowReply(false);
      toast.success("Réponse ajoutée");
    };

    return (
      <div className={`mt-3 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
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
                  <Badge variant="outline" className="text-xs">{comment.authorRole}</Badge>
                )}
                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleLikeComment(postId, comment.id)}
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
          <CommentComponent key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
        ))}
      </div>
    );
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
      setSelectedPost(post);
      setIsViewModalOpen(true);
    }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#0EA8A8] text-white">{post.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1B2A4A]">{post.authorName}</span>
              {post.authorRole && <Badge variant="outline" className="text-xs">{post.authorRole}</Badge>}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{formatDate(post.timestamp)}</span>
              <span>•</span>
              <span>{post.clubName}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSavePost(post.id); }}>
          {post.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </Button>
      </div>

      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{post.title}</h3>
      <p className="text-gray-700 mb-3 line-clamp-3 whitespace-pre-wrap">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {post.images.slice(0, 2).map((img, idx) => (
            <img key={idx} src={img} alt="" className="rounded-lg object-cover w-full h-40 cursor-pointer" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
        <span>{post.likes} likes</span>
        <span>{post.commentCount} commentaires</span>
        <span>{post.shareCount} partages</span>
      </div>

      <div className="flex items-center justify-around pt-3 border-t border-gray-100 mt-2">
        <button onClick={(e) => { e.stopPropagation(); handleLikePost(post.id); }} className={`flex items-center gap-2 px-4 py-1 rounded-lg ${post.isLiked ? 'text-[#0EA8A8]' : 'text-gray-500 hover:bg-gray-100'}`}>
          <ThumbsUp className={`w-5 h-5 ${post.isLiked ? 'fill-[#0EA8A8]' : ''}`} />
          <span>J'aime</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); setSelectedPost(post); setIsViewModalOpen(true); }} className="flex items-center gap-2 px-4 py-1 rounded-lg text-gray-500 hover:bg-gray-100">
          <MessageCircle className="w-5 h-5" />
          <span>Commenter</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleSharePost(post); }} className="flex items-center gap-2 px-4 py-1 rounded-lg text-gray-500 hover:bg-gray-100">
          <Share2 className="w-5 h-5" />
          <span>Partager</span>
        </button>
      </div>
    </Card>
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="member"  />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav userId={memberData.id} userName={currentUser.firstName} userAvatar={memberData.avatar} userRole={memberData.roleLabel} userRoleType="member" notificationCount={3} onLogout={() => { localStorage.removeItem('token'); window.location.href = "/login"; }} />

        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1B2A4A]">Forums</h1>
              <p className="text-gray-600">Rejoignez des forums et participez aux discussions</p>
            </div>

            {/* Mes forums */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Mes forums
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberForums.map((forum) => (
                  <button
                    key={forum.id}
                    onClick={() => handleSelectForum(forum)}
                    className={`text-left p-4 rounded-xl transition-all border-2 ${
                      selectedClub?.id === forum.id
                        ? `bg-gradient-to-r ${forum.color} text-white shadow-lg border-transparent`
                        : 'bg-white hover:shadow-md border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${selectedClub?.id === forum.id ? 'text-white' : 'text-[#1B2A4A]'}`}>
                          {forum.name}
                        </h3>
                        <p className={`text-sm mt-1 ${selectedClub?.id === forum.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {forum.description}
                        </p>
                        <div className="flex gap-3 mt-3 text-xs">
                          <span>{forum.memberCount} membres</span>
                          <span>{forum.postCount} posts</span>
                          {forum.joinDate && <span>Membre depuis {format(new Date(forum.joinDate), 'MMM yyyy', { locale: fr })}</span>}
                        </div>
                      </div>
                      {selectedClub?.id === forum.id && (
                        <div className="ml-3">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <ChevronRight className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Forums disponibles à rejoindre */}
            {availableForumsList.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0EA8A8]" />
                  Forums disponibles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableForumsList.map((forum) => (
                    <Card key={forum.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#1B2A4A]">{forum.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{forum.description}</p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-400">
                            <span>{forum.memberCount} membres</span>
                            <span>{forum.postCount} posts</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedForumToJoin(forum);
                            setIsJoinModalOpen(true);
                          }}
                          className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                        >
                          Rejoindre
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Forum sélectionné */}
            {selectedClub ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1B2A4A]">{selectedClub.name}</h2>
                    <p className="text-gray-600">{selectedClub.description}</p>
                  </div>
                  <Button onClick={() => setIsPostModalOpen(true)} className="bg-[#0EA8A8]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau post
                  </Button>
                </div>

                <div className="mb-6 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Rechercher dans le forum..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
                </div>

                <div className="space-y-4">
                  {filteredPosts.length === 0 ? (
                    <Card className="p-12 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun post trouvé</p>
                      <Button variant="link" onClick={() => setIsPostModalOpen(true)} className="mt-2 text-[#0EA8A8]">Créer le premier post</Button>
                    </Card>
                  ) : (
                    filteredPosts.map(post => <PostCard key={post.id} post={post} />)
                  )}
                </div>
              </>
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun forum sélectionné</h3>
                <p className="text-gray-500">Sélectionnez un forum ci-dessus pour commencer à interagir</p>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Modal Nouveau Post */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer une publication dans {selectedClub?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Quoi de neuf ?" rows={6} />
            {newPostImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {newPostImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt="" className="rounded-lg w-full h-32 object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2">
            <div className="flex justify-between w-full">
              <div>
                <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}><ImageIcon className="w-4 h-4 mr-2" />Image</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>Annuler</Button>
                <Button onClick={handleCreatePost} className="bg-[#0EA8A8]">Publier</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejoindre Forum */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejoindre le forum</DialogTitle>
            <DialogDescription>Vous allez rejoindre le forum {selectedForumToJoin?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">En rejoignant ce forum, vous pourrez :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
              <li>Voir et participer aux discussions</li>
              <li>Créer vos propres publications</li>
              <li>Commenter et réagir aux posts</li>
              <li>Recevoir les notifications du forum</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>Annuler</Button>
            <Button onClick={handleJoinForum} className="bg-[#0EA8A8]">Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Vue Détail Post */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-[#0EA8A8] text-white">{selectedPost.authorName.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <div className="flex items-center gap-2"><span className="font-semibold">{selectedPost.authorName}</span>{selectedPost.authorRole && <Badge variant="outline">{selectedPost.authorRole}</Badge>}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400"><span>{formatDate(selectedPost.timestamp)}</span><span>•</span><span>{selectedPost.clubName}</span></div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#1B2A4A]">{selectedPost.title}</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">{selectedPost.images.map((img, idx) => <img key={idx} src={img} alt="" className="rounded-lg" />)}</div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500"><span>{selectedPost.likes} likes</span><span>{selectedPost.commentCount} commentaires</span><span>{selectedPost.shareCount} partages</span></div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <button onClick={() => handleLikePost(selectedPost.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedPost.isLiked ? 'text-[#0EA8A8] bg-[#0EA8A8]/10' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <ThumbsUp className={`w-5 h-5 ${selectedPost.isLiked ? 'fill-[#0EA8A8]' : ''}`} /><span>J'aime</span>
                  </button>
                  <button onClick={() => handleSharePost(selectedPost)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"><Share2 className="w-5 h-5" /><span>Partager</span></button>
                </div>
                <div className="space-y-4 pt-2">
                  <h3 className="font-semibold text-[#1B2A4A]">Commentaires ({selectedPost.commentCount})</h3>
                  <div className="flex gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="bg-[#0EA8A8] text-white text-xs">{memberData.fullName.charAt(0)}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <Textarea placeholder="Écrire un commentaire..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="text-sm" rows={2} />
                      <div className="flex justify-end mt-2"><Button onClick={() => handleAddComment(selectedPost.id)} size="sm" className="bg-[#0EA8A8]"><Send className="w-3 h-3 mr-2" />Commenter</Button></div>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedPost.comments.map(comment => <CommentComponent key={comment.id} comment={comment} postId={selectedPost.id} />)}
                    {selectedPost.comments.length === 0 && <p className="text-center text-gray-500 py-4">Soyez le premier à commenter</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Partage */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Partager cette publication</DialogTitle><DialogDescription>Ajoutez un message pour accompagner votre partage</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea placeholder="Écrivez quelque chose..." value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} rows={3} />
            {selectedPost && (
              <Card className="p-3">
                <div className="flex gap-2">
                  <Avatar className="w-8 h-8"><AvatarFallback className="bg-[#0EA8A8] text-white text-xs">{selectedPost.authorName.charAt(0)}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-semibold">{selectedPost.authorName}</p><p className="text-xs text-gray-500 line-clamp-2">{selectedPost.content}</p></div>
                </div>
              </Card>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsShareModalOpen(false)}>Annuler</Button><Button onClick={handleConfirmShare} className="bg-[#0EA8A8]"><Share2 className="w-4 h-4 mr-2" />Partager</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}