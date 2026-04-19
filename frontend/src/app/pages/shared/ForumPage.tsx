import { useEffect, useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
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

export default function ForumPage() {
  const { user, token } = useAuth();
  const section = getRoleSection(user?.role);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ClubPostType>("DISCUSSION");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clubId = typeof user?.club === "object" ? user.club?._id : user?.club;

  const loadPosts = async () => {
    if (!clubId || !token) {
      return;
    }

    const response = await apiRequest<{ items: ClubPost[] }>(`/posts/club/${clubId}`, { token });
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
      const response = await apiRequest<{ message: string; post: ClubPost }>("/posts", {
        method: "POST",
        token,
        body: JSON.stringify({
          title,
          content,
          type,
          clubId,
        }),
      });

      toast.success(response.message);
      setTitle("");
      setContent("");
      setType("DISCUSSION");
      await loadPosts();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Publication impossible";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Forum du club"
      description="Partagez des discussions, annonces et evenements avec les membres du club."
      sectionOverride={section}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-bold text-[#10233F]">Nouvelle publication</h2>
          <p className="mt-2 text-sm text-gray-500">
            Les membres du bureau publient directement. Les publications des membres passent par moderation admin.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Titre</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre du post" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as ClubPostType)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3"
              >
                <option value="DISCUSSION">Discussion</option>
                <option value="ANNOUNCEMENT">Annonce</option>
                <option value="EVENT">Evenement</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contenu</label>
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Ecrivez votre publication..."
                className="min-h-40"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#0EA8A8] hover:bg-[#0c8e8e]"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#0EA8A8]">{post.type}</p>
                  <h3 className="mt-1 text-xl font-bold text-[#10233F]">{post.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {post.author.name} · {new Date(post.createdAt).toLocaleString("fr-FR")}
                  </p>
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

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">{post.content}</p>

              {post.validatedBy ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="h-4 w-4 text-[#0EA8A8]" />
                  Valide par {post.validatedBy.name}
                </div>
              ) : null}
            </Card>
          ))}

          {posts.length === 0 ? (
            <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              Aucune publication pour le moment.
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
