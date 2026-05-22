import { useEffect, useState } from "react";
import {
  Send,
  ShieldCheck,
  ThumbsUp,
  MessageCircle,
  Image as ImageIcon,
  Video,
  BarChart2,
  Paperclip,
  Mic,
  Smile,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, ApiClientError } from "../../lib/api";
import { getRoleSection } from "../../lib/role";
import type { ClubPost, ClubPostType } from "../../types/club";

function PostCard({ post }: { post: ClubPost }) {
  const { user, token } = useAuth();

  const initialLiked = post.likes?.includes(user?._id || "") || false;
  const initialLikeCount = post.likes?.length || 0;

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReact = async (emojiObj: any) => {
    setShowEmojiPicker(false);
    if (!token) return;
    try {
      const response = await apiRequest<{ message: string; reactions: any[] }>(`/posts/${post._id}/react`, {
        method: "POST",
        token,
        body: JSON.stringify({ emoji: emojiObj.emoji }),
      });
      setReactions(response.reactions);
    } catch (error) {
      toast.error("Impossible d'ajouter la reaction");
    }
  };

  const handleLike = async () => {
    if (!token || isLiking) return;

    // Optistic UI update
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      const response = await apiRequest<{ message: string; likes: string[] }>(
        `/posts/${post._id}/like`,
        {
          method: "POST",
          token,
        },
      );
      setLiked(response.likes.includes(user?._id || ""));
      setLikeCount(response.likes.length);
    } catch (error) {
      // Revert if error
      setLiked(initialLiked);
      setLikeCount(initialLikeCount);
      toast.error("Impossible de liker la publication");
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !token || isCommenting) return;

    setIsCommenting(true);
    try {
      const response = await apiRequest<{ message: string; comments: any[] }>(
        `/posts/${post._id}/comment`,
        {
          method: "POST",
          token,
          body: JSON.stringify({ text: commentText.trim() }),
        },
      );

      setComments(response.comments);
      setCommentText("");
    } catch (error) {
      toast.error("Impossible d'ajouter le commentaire");
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0EA8A8]/10 text-[#0EA8A8] font-bold">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#10233F] leading-tight">
              {post.author.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                {new Date(post.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
              <span>·</span>
              <span className="font-medium text-[#0EA8A8]">{post.type}</span>
            </div>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            post.status === "PUBLISHED"
              ? "bg-emerald-100 text-emerald-700"
              : post.status === "PENDING"
                ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700"
          }`}
        >
          {post.status}
        </span>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-bold text-[#10233F]">{post.title}</h4>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {post.content}
        </p>

        {post.attachment && (
          <div className="mt-4">
            {post.attachment.startsWith("data:image/") ? (
              <img
                src={post.attachment}
                alt={post.attachmentName || "image"}
                className="max-h-96 w-auto rounded-lg object-contain border border-gray-100"
              />
            ) : (
              <a
                href={post.attachment}
                download={post.attachmentName || "download"}
                className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg text-sm hover:bg-indigo-100 transition-colors"
              >
                <Paperclip className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {post.attachmentName || "Fichier attache"}
                </span>
              </a>
            )}
          </div>
        )}
      </div>

      {post.validatedBy ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-[#0EA8A8]" />
          Valide par {post.validatedBy.name}
        </div>
      ) : null}

      <div className="mt-5 border-t border-gray-100 pt-4 flex flex-col gap-2">
        {reactions.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            {reactions.map((r: any) => (
              <span key={r.emoji} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                {r.emoji} {r.users.length}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`rounded-full flex-1 ${liked ? "text-[#0EA8A8] bg-[#0EA8A8]/10 hover:bg-[#0EA8A8]/20" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            {likeCount} J'aime
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="rounded-full flex-1 text-gray-500 hover:bg-gray-100"
          >
            <Smile className="mr-2 h-4 w-4" />
            Reagir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="rounded-full flex-1 text-gray-500 hover:bg-gray-100"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {comments.length} Commentaires
          </Button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
              <EmojiPicker onEmojiClick={handleReact} />
            </div>
          )}
        </div>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4 rounded-xl bg-gray-50/50 p-4">
          <div className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ecrire un commentaire..."
              className="rounded-full bg-white"
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button
              onClick={handleAddComment}
              size="icon"
              className="rounded-full bg-[#0EA8A8] hover:bg-[#0c8e8e]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 mt-4">
            {comments.map((comment: any) => (
              <div key={comment._id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-xs">
                  {comment.author?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 rounded-2xl bg-white p-3 text-sm shadow-sm border border-gray-100">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[#10233F]">
                      {comment.author?.name || "Utilisateur"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-2">
                Soyez le premier a commenter.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function ForumPage() {
  const { user, token } = useAuth();
  const section = getRoleSection(user?.role);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ClubPostType>("DISCUSSION");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment(event.target?.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentName(null);
  };

  const [dateFilter, setDateFilter] = useState<"recent" | "oldest">("recent");
  const [authorFilter, setAuthorFilter] = useState<"all" | "me" | "others">(
    "all",
  );

  const clubId = typeof user?.club === "object" ? user.club?._id : user?.club;

  const loadPosts = async () => {
    if (!clubId || !token) {
      return;
    }

    const response = await apiRequest<{ items: ClubPost[] }>(
      `/posts/club/${clubId}`,
      { token },
    );
    setPosts(response.items);
  };

  useEffect(() => {
    void loadPosts();
  }, [clubId, token]);

  const handleSubmit = async () => {
    if (!token || !clubId || !title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<{ message: string; post: ClubPost }>(
        "/posts",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            title,
            content,
            type,
            clubId,
            ...(attachment ? { attachment, attachmentName } : {}),
          }),
        },
      );

      toast.success(response.message);
      setTitle("");
      setContent("");
      setType("DISCUSSION");
      removeAttachment();
      await loadPosts();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Publication impossible";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredActivePosts = posts
    .filter((post) => post.status !== "REJECTED")
    .filter((post) => {
      if (authorFilter === "me") return post.author._id === user?._id;
      if (authorFilter === "others") return post.author._id !== user?._id;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateFilter === "recent" ? dateB - dateA : dateA - dateB;
    });

  const rejectedPosts = posts.filter((post) => post.status === "REJECTED");

  return (
    <AppShell
      title="Forum du club"
      description="Partagez des discussions, annonces et evenements avec les membres du club."
      sectionOverride={section}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="rounded-[1rem] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-4 flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 space-y-2">
              <input
                className="w-full text-lg font-bold text-[#10233F] outline-none placeholder:text-gray-300"
                placeholder="Titre de votre publication"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Compose new post"
                className="min-h-[80px] border-0 p-0 shadow-none focus-visible:ring-0 resize-none text-gray-700 text-base placeholder:text-gray-400"
              />
              {attachmentName && (
                <div className="flex items-center gap-2 mt-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm w-fit border border-gray-100">
                  <div className="truncate max-w-[200px] font-medium">
                    {attachmentName}
                  </div>
                  <button
                    onClick={removeAttachment}
                    className="ml-2 text-rose-500 hover:text-rose-700 font-bold"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-4 py-3">
            <div className="flex items-center gap-4 text-gray-400">
              <label className="cursor-pointer flex items-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                />
                <ImageIcon className="h-5 w-5 hover:text-gray-600 transition-colors" />
              </label>

              <BarChart2 className="h-5 w-5 cursor-pointer hidden sm:block hover:text-gray-600 transition-colors" />

              <label className="cursor-pointer flex items-center">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Paperclip className="h-5 w-5 hover:text-gray-600 transition-colors" />
              </label>

              <div className="h-5 w-px bg-gray-300 mx-1"></div>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as ClubPostType)
                }
                className="bg-transparent text-sm font-medium text-gray-500 outline-none cursor-pointer hover:text-gray-700"
              >
                <option value="DISCUSSION">Discussion</option>
                <option value="ANNOUNCEMENT">Annonce</option>
                <option value="EVENT">Evenement</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-[#10233F] hover:text-[#0EA8A8] transition-colors">
                Post Later
              </button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !content.trim() || !title.trim()}
                className="bg-[#3B28CC] hover:bg-[#2d1ea3] text-white px-8 rounded-lg font-medium"
              >
                {isSubmitting ? "..." : "Post"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between mt-8 mb-4 border-b border-gray-100 pb-4">
          <div className="flex gap-4 border-b-2 border-transparent">
            <span className="font-bold text-[#10233F] border-b-2 border-[#3B28CC] pb-1 cursor-pointer">
              All Posts
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value as any)}
              className="text-sm font-medium text-gray-500 bg-transparent outline-none cursor-pointer hover:text-gray-700"
            >
              <option value="all">Tout le monde</option>
              <option value="me">Mes publications</option>
              <option value="others">Autres membres</option>
            </select>
            <div className="h-4 w-px bg-gray-300"></div>
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as "recent" | "oldest")
              }
              className="text-sm font-medium text-gray-500 bg-transparent outline-none cursor-pointer hover:text-gray-700"
            >
              <option value="recent">Plus recents</option>
              <option value="oldest">Plus anciens</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredActivePosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {filteredActivePosts.length === 0 ? (
            <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-center text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              Aucune publication pour ces filtres.
            </Card>
          ) : null}
        </div>

        {rejectedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-red-100">
            <h3 className="mb-6 text-lg font-bold text-red-600 px-2">
              Publications rejetees
            </h3>
            <div className="space-y-6 opacity-75">
              {rejectedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
