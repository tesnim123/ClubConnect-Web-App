import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import type { ClubPost } from "../../types/club";

export default function AdminModerationPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<ClubPost[]>([]);

  const loadPosts = async () => {
    if (!token) {
      return;
    }

    const response = await apiRequest<{ items: ClubPost[] }>("/admin/posts/pending", { token });
    setPosts(response.items);
  };

  useEffect(() => {
    void loadPosts();
  }, [token]);

  const moderate = async (postId: string, action: "publish" | "reject") => {
    if (!token) {
      return;
    }

    await apiRequest(`/admin/posts/${postId}/${action}`, {
      method: "PATCH",
      token,
    });

    toast.success(action === "publish" ? "Post publie." : "Post rejete.");
    await loadPosts();
  };

  return (
    <AppShell
      title="Moderation du forum"
      description="Validez ou rejetez les publications en attente des membres."
      sectionOverride="admin"
    >
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id} className="rounded-[1.5rem] border-0 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0EA8A8]">{post.type}</p>
                <h2 className="mt-1 text-xl font-bold text-[#10233F]">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-500">{post.author.name} · {post.club.name}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">{post.content}</p>
              </div>

              <div className="flex min-w-[220px] flex-col gap-3">
                <Button onClick={() => void moderate(post._id, "publish")} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Publier
                </Button>
                <Button onClick={() => void moderate(post._id, "reject")} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {posts.length === 0 ? (
          <Card className="rounded-[1.5rem] border-0 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Aucun post en attente de moderation.
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
