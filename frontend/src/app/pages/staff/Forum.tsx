import { useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronRight,
  MessageCircle,
  Plus,
  Search,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { clubForums, forumPosts, members } from "../../data/mockData";

export default function StaffForum() {
  const president = members.find((member) => member.role === "president") ?? members[0];
  const forums = clubForums.filter((forum) => forum.clubId === president.clubId);
  const [selectedForumId, setSelectedForumId] = useState(forums[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [posts, setPosts] = useState(forumPosts.filter((post) => post.clubId === president.clubId));

  const selectedForum = forums.find((forum) => forum.id === selectedForumId) ?? null;
  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          post.forumId === selectedForumId &&
          `${post.title} ${post.body} ${post.tags.join(" ")}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [posts, searchQuery, selectedForumId],
  );

  const publishPost = () => {
    if (!selectedForum || !newPostTitle.trim() || !newPostBody.trim()) {
      toast.error("Completez le titre et le contenu du post.");
      return;
    }

    setPosts((prev) => [
      {
        id: `${Date.now()}`,
        forumId: selectedForum.id,
        clubId: president.clubId,
        clubName: president.clubName,
        authorId: president.id,
        authorName: `${president.firstName} ${president.lastName}`,
        authorAvatar: president.avatar,
        title: newPostTitle,
        body: newPostBody,
        tags: [selectedForum.visibility === "staff" ? "Staff" : "Club"],
        reactions: 0,
        commentCount: 0,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewPostTitle("");
    setNewPostBody("");
    setIsPostModalOpen(false);
    toast.success("Post publie.");
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="president" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userId={president.id}
          userName={`${president.firstName} ${president.lastName}`}
          userAvatar={president.avatar}
          userRole="President"
          userRoleType="staff"
          notificationCount={posts.length}
        />

        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1B2A4A]">Forum</h1>
              <p className="text-gray-600">Publiez et suivez les discussions du club avec le meme style que l&apos;espace membre.</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Mes forums
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forums.map((forum) => (
                  <button
                    key={forum.id}
                    onClick={() => setSelectedForumId(forum.id)}
                    className={`text-left p-4 rounded-xl transition-all border-2 ${
                      selectedForumId === forum.id
                        ? "bg-gradient-to-r from-[#0EA8A8] to-[#1B2A4A] text-white shadow-lg border-transparent"
                        : "bg-white hover:shadow-md border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${selectedForumId === forum.id ? "text-white" : "text-[#1B2A4A]"}`}>
                          {forum.name}
                        </h3>
                        <p className={`text-sm mt-1 ${selectedForumId === forum.id ? "text-white/80" : "text-gray-500"}`}>
                          {forum.description}
                        </p>
                        <div className="flex gap-3 mt-3 text-xs">
                          <span>{forum.memberCount} membres</span>
                          <span>{forum.postCount} posts</span>
                        </div>
                      </div>
                      {selectedForumId === forum.id && (
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

            {selectedForum ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1B2A4A]">{selectedForum.name}</h2>
                    <p className="text-gray-600">{selectedForum.description}</p>
                  </div>
                  <Button onClick={() => setIsPostModalOpen(true)} className="bg-[#0EA8A8]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau post
                  </Button>
                </div>

                <div className="mb-6 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher dans le forum..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>

                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-[#0EA8A8] text-white">
                              {post.authorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1B2A4A]">{post.authorName}</span>
                              <Badge variant="outline">{selectedForum.visibility === "staff" ? "Staff" : "Club"}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{new Date(post.timestamp).toLocaleDateString("fr-FR")}</span>
                              <span>{post.clubName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{post.title}</h3>
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.body}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {post.reactions}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.commentCount}
                        </span>
                      </div>
                    </Card>
                  ))}

                  {filteredPosts.length === 0 && (
                    <Card className="p-12 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun post trouve</p>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-500">Aucun forum disponible.</p>
              </Card>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Creer une publication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newPostTitle}
              onChange={(event) => setNewPostTitle(event.target.value)}
              placeholder="Titre"
            />
            <Textarea
              value={newPostBody}
              onChange={(event) => setNewPostBody(event.target.value)}
              placeholder="Quoi de neuf ?"
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={publishPost} className="bg-[#0EA8A8]">
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
