import { useMemo, useState } from "react";
import { useLocation } from "react-router";
import {
  CheckCircle,
  Eye,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Sparkles,
  ThumbsUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
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
  const location = useLocation();
  const isPresidentView = location.pathname.startsWith("/president");
  const actor = isPresidentView
    ? members.find((member) => member.role === "president") ?? members[0]
    : members.find((member) => member.role === "staff") ?? members[0];

  const forums = clubForums.filter((forum) => forum.clubId === actor.clubId);
  const [selectedForumId, setSelectedForumId] = useState(forums[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [activeTab, setActiveTab] = useState<"discussion" | "featured" | "media" | "files">("discussion");
  const [posts, setPosts] = useState(forumPosts.filter((post) => post.clubId === actor.clubId));
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const selectedForum = forums.find((forum) => forum.id === selectedForumId) ?? null;
  const filteredPosts = useMemo(
    () =>
      posts
        .filter(
          (post) =>
            post.forumId === selectedForumId &&
            `${post.title} ${post.body} ${post.tags.join(" ")}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned)),
    [posts, searchQuery, selectedForumId],
  );

  const featuredPosts = useMemo(
    () => filteredPosts.filter((post) => post.isPinned || post.reactions >= 10),
    [filteredPosts],
  );

  const mediaPosts = useMemo(
    () =>
      filteredPosts.filter((post) =>
        post.attachments?.some((attachment) => attachment.type === "image"),
      ),
    [filteredPosts],
  );

  const filePosts = useMemo(
    () => filteredPosts.filter((post) => (post.attachments?.length ?? 0) > 0),
    [filteredPosts],
  );

  const visiblePosts = useMemo(() => {
    switch (activeTab) {
      case "featured":
        return featuredPosts;
      case "media":
        return mediaPosts;
      case "files":
        return filePosts;
      default:
        return filteredPosts;
    }
  }, [activeTab, featuredPosts, mediaPosts, filePosts, filteredPosts]);

  const highlightedPost = featuredPosts[0] ?? filteredPosts[0];

  const emptyState = {
    discussion: {
      title: "Aucune publication",
      description: "Lancez la conversation avec un premier post.",
      icon: MessageCircle,
    },
    featured: {
      title: "Aucune publication a la une",
      description: "Epinglez un post ou laissez l'activite mettre en avant les sujets importants.",
      icon: Pin,
    },
    media: {
      title: "Aucun media partage",
      description: "Les publications avec images apparaitront ici.",
      icon: ImageIcon,
    },
    files: {
      title: "Aucun fichier partage",
      description: "Les posts avec pieces jointes seront centralises ici.",
      icon: FileText,
    },
  }[activeTab];

  const publishPost = () => {
    if (!selectedForum || !newPostTitle.trim() || !newPostBody.trim()) {
      toast.error("Completez le titre et le contenu du post.");
      return;
    }

    if (editingPostId) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPostId
            ? { ...post, title: newPostTitle, body: newPostBody }
            : post,
        ),
      );
      toast.success("Post mis a jour.");
    } else {
      setPosts((prev) => [
        {
          id: `${Date.now()}`,
          forumId: selectedForum.id,
          clubId: actor.clubId,
          clubName: actor.clubName,
          authorId: actor.id,
          authorName: `${actor.firstName} ${actor.lastName}`,
          authorAvatar: actor.avatar,
          title: newPostTitle,
          body: newPostBody,
          tags: [selectedForum.visibility === "staff" ? "Staff" : "Club"],
          reactions: 0,
          commentCount: 0,
          timestamp: new Date().toISOString(),
          isPinned: false,
        },
        ...prev,
      ]);
      toast.success("Post publie.");
    }

    setNewPostTitle("");
    setNewPostBody("");
    setEditingPostId(null);
    setIsPostModalOpen(false);
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    setEditingPostId(postId);
    setNewPostTitle(post.title);
    setNewPostBody(post.body);
    setIsPostModalOpen(true);
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    toast.success("Post supprime.");
  };

  const handleTogglePin = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isPinned: !post.isPinned } : post,
      ),
    );
    toast.success("Configuration du post mise a jour.");
  };

  return (
    <div className="flex h-screen">
      <Sidebar role={isPresidentView ? "president" : "staff"} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userId={actor.id}
          userName={`${actor.firstName} ${actor.lastName}`}
          userAvatar={actor.avatar}
          userRole={isPresidentView ? "President" : "Staff"}
          userRoleType={isPresidentView ? "president" : "staff"}
          notificationCount={posts.length}
        />

        <main className="flex-1 overflow-y-auto bg-[#EEF2F7] p-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
              <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
                <Card className="overflow-hidden gap-0">
                  <div className="bg-gradient-to-br from-[#1B2A4A] via-[#214F72] to-[#0EA8A8] p-5 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-white/75">Forum du club</p>
                        <h1 className="text-2xl font-bold">{actor.clubName}</h1>
                      </div>
                    </div>
                    <p className="text-sm text-white/80">
                      Un fil d&apos;actualite pour centraliser annonces, retours et discussions de l&apos;equipe.
                    </p>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-2xl bg-[#F7F8FC] p-3">
                        <p className="text-xs text-gray-500">Forums</p>
                        <p className="text-xl font-bold text-[#1B2A4A]">{forums.length}</p>
                      </div>
                      <div className="rounded-2xl bg-[#F7F8FC] p-3">
                        <p className="text-xs text-gray-500">Posts</p>
                        <p className="text-xl font-bold text-[#1B2A4A]">{filteredPosts.length}</p>
                      </div>
                      <div className="rounded-2xl bg-[#F7F8FC] p-3">
                        <p className="text-xs text-gray-500">Membres</p>
                        <p className="text-xl font-bold text-[#1B2A4A]">{selectedForum?.memberCount ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-[#0EA8A8]" />
                    <h2 className="text-lg font-bold text-[#1B2A4A]">Espaces</h2>
                  </div>
                  <div className="space-y-3">
                    {forums.map((forum) => (
                      <button
                        key={forum.id}
                        onClick={() => setSelectedForumId(forum.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          selectedForumId === forum.id
                            ? "border-transparent bg-[#1B2A4A] text-white shadow-lg"
                            : "border-gray-200 bg-white hover:bg-[#F7F8FC]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{forum.name}</p>
                            <p className={`mt-1 text-sm ${selectedForumId === forum.id ? "text-white/75" : "text-gray-500"}`}>
                              {forum.description}
                            </p>
                          </div>
                          <Badge className={selectedForumId === forum.id ? "bg-white text-[#1B2A4A]" : "bg-[#0EA8A8]"}>
                            {forum.visibility}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </aside>

              <section className="space-y-5 min-w-0">
                {selectedForum && (
                  <>
                    <Card className="overflow-hidden gap-0 border-none shadow-sm">
                      <div className="h-56 bg-[linear-gradient(135deg,#1B2A4A_0%,#23486B_45%,#0EA8A8_100%)]" />
                      <div className="bg-white px-6 pb-5">
                        <div className="-mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          <div className="flex items-end gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-[#0EA8A8] text-3xl font-bold text-white shadow-md">
                              {selectedForum.name.charAt(0)}
                            </div>
                            <div className="pb-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className="bg-[#1B2A4A]">{selectedForum.visibility}</Badge>
                                <Badge variant="outline">{actor.clubName}</Badge>
                              </div>
                              <h2 className="text-3xl font-bold text-[#1B2A4A]">{selectedForum.name}</h2>
                              <p className="mt-1 max-w-2xl text-sm text-gray-500">{selectedForum.description}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  {selectedForum.memberCount} membres
                                </span>
                                <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {filteredPosts.length} publications
                                </span>
                                <span className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Activite staff et president
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="rounded-xl">
                              <Users className="w-4 h-4 mr-2" />
                              Inviter
                            </Button>
                            <Button className="rounded-xl bg-[#0EA8A8] hover:bg-[#0c8e8e]" onClick={() => setIsPostModalOpen(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Creer un post
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setActiveTab("discussion")}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                              activeTab === "discussion"
                                ? "bg-[#EAF4F4] text-[#0A7878]"
                                : "text-gray-500 hover:bg-[#F1F4F9]"
                            }`}
                          >
                            Discussion
                          </button>
                          <button
                            onClick={() => setActiveTab("featured")}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                              activeTab === "featured"
                                ? "bg-[#EAF4F4] text-[#0A7878]"
                                : "text-gray-500 hover:bg-[#F1F4F9]"
                            }`}
                          >
                            A la une
                          </button>
                          <button
                            onClick={() => setActiveTab("media")}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                              activeTab === "media"
                                ? "bg-[#EAF4F4] text-[#0A7878]"
                                : "text-gray-500 hover:bg-[#F1F4F9]"
                            }`}
                          >
                            Medias
                          </button>
                          <button
                            onClick={() => setActiveTab("files")}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                              activeTab === "files"
                                ? "bg-[#EAF4F4] text-[#0A7878]"
                                : "text-gray-500 hover:bg-[#F1F4F9]"
                            }`}
                          >
                            Fichiers
                          </button>
                        </div>
                      </div>
                    </Card>

                    <Card className="overflow-hidden gap-0 border-none shadow-sm">
                      <div className="border-b bg-white p-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-[#0EA8A8] text-white">
                              {actor.firstName[0]}
                              {actor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <button
                            onClick={() => setIsPostModalOpen(true)}
                            className="flex-1 rounded-full bg-[#F1F4F9] px-5 py-3 text-left text-sm text-gray-500 transition-colors hover:bg-[#E7ECF3]"
                          >
                            Exprimez-vous dans {selectedForum.name}...
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Rechercher dans ce fil..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="h-11 rounded-full border-none bg-[#F1F4F9] pl-11 shadow-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Sparkles className="w-4 h-4" />
                          Fil le plus recent
                        </div>
                      </div>
                    </Card>

                    {visiblePosts.length === 0 ? (
                      <Card className="border-none p-12 text-center shadow-sm">
                        <emptyState.icon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="mb-2 text-lg font-semibold text-[#1B2A4A]">{emptyState.title}</h3>
                        <p className="text-gray-500">{emptyState.description}</p>
                      </Card>
                    ) : (
                      visiblePosts.map((post) => (
                        <Card key={post.id} className="gap-0 overflow-visible border-none shadow-sm">
                          {post.isPinned && (
                            <div className="flex items-center gap-2 border-b bg-[#FFF5DD] px-5 py-3 text-sm text-[#8A6200]">
                              <Pin className="w-4 h-4" />
                              Publication epinglee
                            </div>
                          )}

                          <div className="bg-white p-5">
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11">
                                  <AvatarFallback className="bg-[#0EA8A8] text-white">
                                    {post.authorName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-[#1B2A4A]">{post.authorName}</span>
                                    <Badge variant="outline">{selectedForum.visibility === "staff" ? "Staff" : "Club"}</Badge>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                    <span>{new Date(post.timestamp).toLocaleDateString("fr-FR")}</span>
                                    <span>•</span>
                                    <span>{post.clubName}</span>
                                  </div>
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 rounded-full p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleTogglePin(post.id)}>
                                    {post.isPinned ? "Retirer l epingle" : "Epingler"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditPost(post.id)}>
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeletePost(post.id)} variant="destructive">
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-[#1B2A4A]">{post.title}</h3>
                            <p className="mb-4 whitespace-pre-wrap leading-7 text-gray-700">{post.body}</p>

                            <div className="mb-4 flex flex-wrap gap-2">
                              {post.tags.map((tag) => (
                                <Badge key={tag} className="bg-[#EEF7F6] text-[#0A7878] hover:bg-[#E2F0EF]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {activeTab === "media" && post.attachments?.some((attachment) => attachment.type === "image") && (
                              <div className="mb-4 rounded-2xl border border-[#DCE6F0] bg-[#F7FAFC] p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1B2A4A]">
                                  <ImageIcon className="h-4 w-4 text-[#0EA8A8]" />
                                  Galerie du post
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {post.attachments
                                    ?.filter((attachment) => attachment.type === "image")
                                    .map((attachment) => (
                                      <div
                                        key={attachment.id}
                                        className="rounded-2xl bg-[linear-gradient(135deg,#E9F4F3_0%,#DCEBF4_100%)] p-4"
                                      >
                                        <p className="font-medium text-[#1B2A4A]">{attachment.name}</p>
                                        <p className="mt-1 text-sm text-gray-500">Media partage dans ce forum</p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {activeTab === "files" && post.attachments && post.attachments.length > 0 && (
                              <div className="mb-4 rounded-2xl border border-[#DCE6F0] bg-[#F7FAFC] p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1B2A4A]">
                                  <FileText className="h-4 w-4 text-[#0EA8A8]" />
                                  Fichiers du post
                                </div>
                                <div className="space-y-3">
                                  {post.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                                    >
                                      <div>
                                        <p className="font-medium text-[#1B2A4A]">{attachment.name}</p>
                                        <p className="text-sm text-gray-500">{attachment.type}</p>
                                      </div>
                                      <Badge variant="outline">{attachment.size ?? "Document"}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between border-t border-b border-gray-100 py-3 text-sm text-gray-500">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0EA8A8]/10">
                                    <ThumbsUp className="w-3.5 h-3.5 text-[#0EA8A8]" />
                                  </span>
                                  {post.reactions} reactions
                                </span>
                                <span>{post.commentCount} commentaires</span>
                              </div>
                              <span>{selectedForum.visibility === "staff" ? "Espace staff" : "Espace club"}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-3 md:grid-cols-3">
                              <Button variant="ghost" className="justify-center rounded-xl text-gray-600">
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                J&apos;aime
                              </Button>
                              <Button variant="ghost" className="justify-center rounded-xl text-gray-600">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Commenter
                              </Button>
                              <Button variant="ghost" className="justify-center rounded-xl text-gray-600 md:flex hidden">
                                <Users className="w-4 h-4 mr-2" />
                                Partager
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </>
                )}
              </section>

              <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
                <Card className="p-5">
                  <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">A la une</h2>
                  {highlightedPost ? (
                    <div className="rounded-2xl bg-[#F7F8FC] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge className="bg-[#F5A623]">Top post</Badge>
                        {highlightedPost.isPinned && <Badge variant="outline">Epingle</Badge>}
                      </div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-2">{highlightedPost.title}</h3>
                      <p className="line-clamp-4 text-sm text-gray-600">{highlightedPost.body}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune publication marquee.</p>
                  )}
                </Card>

                {selectedForum && (
                  <Card className="p-5">
                    <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Resume du forum</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3">
                        <span className="text-gray-500">Visibilite</span>
                        <span className="font-semibold text-[#1B2A4A]">{selectedForum.visibility}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3">
                        <span className="text-gray-500">Publications</span>
                        <span className="font-semibold text-[#1B2A4A]">{filteredPosts.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3">
                        <span className="text-gray-500">Membres</span>
                        <span className="font-semibold text-[#1B2A4A]">{selectedForum.memberCount}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPostId ? "Modifier la publication" : "Creer une publication"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 rounded-2xl bg-[#F7F8FC] p-4">
              <Avatar className="w-11 h-11">
                <AvatarFallback className="bg-[#0EA8A8] text-white">
                  {actor.firstName[0]}
                  {actor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-[#1B2A4A]">{actor.firstName} {actor.lastName}</p>
                <p className="text-sm text-gray-500">{selectedForum?.name}</p>
              </div>
            </div>

            <Input
              value={newPostTitle}
              onChange={(event) => setNewPostTitle(event.target.value)}
              placeholder="Titre de la publication"
              className="h-11"
            />
            <Textarea
              value={newPostBody}
              onChange={(event) => setNewPostBody(event.target.value)}
              placeholder="Partagez une mise a jour, une annonce ou une idee..."
              rows={8}
              className="min-h-44"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={publishPost} className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
              {editingPostId ? "Enregistrer" : "Publier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
