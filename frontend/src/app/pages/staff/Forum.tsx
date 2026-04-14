import { ReactNode, useMemo, useState } from "react";
import { useLocation } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Globe2,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Phone,
  Plus,
  Search,
  Send,
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { clubForums, forumPosts, members } from "../../data/mockData";

type FeedFilter = "all" | "featured" | "photos" | "files";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function StaffForum() {
  const location = useLocation();
  const isPresidentView = location.pathname.startsWith("/president");
  const actor = isPresidentView
    ? members.find((member) => member.role === "president") ?? members[0]
    : members.find((member) => member.role === "staff") ?? members[0];

  const forums = clubForums.filter((forum) => forum.clubId === actor.clubId);
  const [selectedForumId, setSelectedForumId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [posts, setPosts] = useState(
    forumPosts
      .filter((post) => post.clubId === actor.clubId)
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
  );

  const query = searchQuery.toLowerCase();
  const selectedForum = forums.find((forum) => forum.id === selectedForumId) ?? null;

  const filteredForums = useMemo(
    () =>
      forums.filter((forum) =>
        `${forum.name} ${forum.description} ${forum.visibility}`
          .toLowerCase()
          .includes(query),
      ),
    [forums, query],
  );

  const currentPosts = useMemo(() => {
    if (!selectedForum) return [];

    const base = posts
      .filter((post) => post.forumId === selectedForum.id)
      .filter((post) =>
        `${post.title} ${post.body} ${post.tags.join(" ")}`
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) => {
        if (!!a.isPinned === !!b.isPinned) return +new Date(b.timestamp) - +new Date(a.timestamp);
        return Number(!!b.isPinned) - Number(!!a.isPinned);
      });

    if (filter === "featured") return base.filter((post) => post.isPinned || post.reactions >= 10);
    if (filter === "photos") {
      return base.filter((post) => post.attachments?.some((attachment) => attachment.type === "image"));
    }
    if (filter === "files") return base.filter((post) => (post.attachments?.length ?? 0) > 0);
    return base;
  }, [filter, posts, query, selectedForum]);

  const stats = useMemo(() => {
    if (!selectedForum) return null;
    const forumOnly = posts.filter((post) => post.forumId === selectedForum.id);
    return {
      postCount: forumOnly.length,
      reactions: forumOnly.reduce((sum, post) => sum + post.reactions, 0),
      comments: forumOnly.reduce((sum, post) => sum + post.commentCount, 0),
      highlighted:
        forumOnly.find((post) => post.isPinned) ??
        [...forumOnly].sort((a, b) => b.reactions - a.reactions)[0] ??
        null,
    };
  }, [posts, selectedForum]);

  const resetComposer = () => {
    setEditingPostId(null);
    setNewPostTitle("");
    setNewPostBody("");
  };

  const openComposer = () => {
    resetComposer();
    setIsPostModalOpen(true);
  };

  const openForum = (forumId: string) => {
    setSelectedForumId(forumId);
    setSearchQuery("");
    setFilter("all");
  };

  const publishPost = () => {
    if (!selectedForum || !newPostTitle.trim() || !newPostBody.trim()) {
      toast.error("Completez le titre et le contenu du post.");
      return;
    }

    if (editingPostId) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPostId
            ? { ...post, title: newPostTitle.trim(), body: newPostBody.trim() }
            : post,
        ),
      );
      toast.success("Publication mise a jour.");
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
          title: newPostTitle.trim(),
          body: newPostBody.trim(),
          tags: [selectedForum.visibility === "staff" ? "Staff" : "Club", "Annonce"],
          reactions: 0,
          commentCount: 0,
          timestamp: new Date().toISOString(),
          isPinned: false,
        },
        ...prev,
      ]);
      toast.success("Publication creee.");
    }

    resetComposer();
    setIsPostModalOpen(false);
  };

  const editPost = (postId: string) => {
    const found = posts.find((post) => post.id === postId);
    if (!found) return;
    setEditingPostId(postId);
    setNewPostTitle(found.title);
    setNewPostBody(found.body);
    setIsPostModalOpen(true);
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    toast.success("Publication supprimee.");
  };

  const togglePin = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, isPinned: !post.isPinned } : post)),
    );
    toast.success("Publication mise a jour.");
  };

  return (
    <div className="flex h-screen bg-[#E8EEF5]">
      <Sidebar role={isPresidentView ? "president" : "staff"} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav
          userId={actor.id}
          userName={`${actor.firstName} ${actor.lastName}`}
          userAvatar={actor.avatar}
          userRole={isPresidentView ? "President" : "Staff"}
          userRoleType={isPresidentView ? "president" : "staff"}
          notificationCount={posts.length}
        />

        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef3f9_55%,#e6edf5_100%)] p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {!selectedForum ? (
              <div className="space-y-6">
                <Card className="overflow-hidden border-0 shadow-[0_18px_48px_rgba(27,42,74,0.08)]">
                  <div className="bg-[linear-gradient(135deg,#1B2A4A_0%,#24587d_55%,#0EA8A8_100%)] px-6 py-8 text-white">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-3xl">
                        <h1 className="text-3xl font-bold md:text-4xl">
                          Les forums du {actor.clubName}
                        </h1>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Forums" value={forums.length} />
                        <StatCard label="Posts" value={posts.length} />
                        <StatCard
                          label="Membres"
                          value={forums.reduce((sum, forum) => sum + forum.memberCount, 0)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid gap-6">
                  <section className="space-y-5">
                    <Card className="border-0 bg-white p-4 shadow-sm">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Rechercher un forum..."
                          className="h-12 rounded-full border-0 bg-[#F3F6FA] pl-11 shadow-none"
                        />
                      </div>
                    </Card>

                    <div className="grid gap-5 md:grid-cols-2">
                      {filteredForums.map((forum) => {
                        const recentPost = posts.find((post) => post.forumId === forum.id);
                        return (
                          <button
                            key={forum.id}
                            type="button"
                            onClick={() => openForum(forum.id)}
                            className="group text-left"
                          >
                            <Card className="overflow-hidden border-0 p-0 shadow-[0_18px_36px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-1">
                              <div className="h-32 bg-[linear-gradient(135deg,#d7e0ef_0%,#eef4fb_55%,#d7f3f0_100%)]" />
                              <div className="relative px-5 pb-5">
                                <div className="-mt-10 flex items-end justify-between">
                                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border-4 border-white bg-[#1877F2] text-2xl font-bold text-white shadow-lg">
                                    {forum.name.charAt(0)}
                                  </div>
                                  <Badge className="rounded-full bg-[#EEF4FF] text-[#1877F2]">
                                    {forum.visibility === "staff" ? "Prive" : "Public"}
                                  </Badge>
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-[#15233B]">{forum.name}</h2>
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                  {forum.description}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                                  <span className="rounded-full bg-[#F4F7FB] px-3 py-1">{forum.postCount} sujets</span>
                                  <span className="rounded-full bg-[#F4F7FB] px-3 py-1">{forum.memberCount} membres</span>
                                </div>
                                <div className="mt-4 rounded-2xl bg-[#F7F9FC] p-4">
                                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Derniere activite</p>
                                  <p className="mt-2 line-clamp-2 text-sm font-medium text-[#15233B]">
                                    {recentPost?.title ?? "Aucune publication pour le moment"}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[#1877F2]">
                                  <span>Ouvrir le forum</span>
                                  <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                </div>
                              </div>
                            </Card>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_280px]">
                <section className="min-w-0 space-y-5">
                  <Card className="overflow-hidden border-0 p-0 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                    <div className="relative h-52 bg-[linear-gradient(135deg,#d7e0ef_0%,#eef4fb_55%,#d7f3f0_100%)]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-4 h-10 w-10 rounded-full bg-white/95 p-0 text-slate-700 shadow-md backdrop-blur hover:bg-white"
                        onClick={() => setSelectedForumId("")}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="relative px-6 pb-6">
                      <div className="-mt-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                          <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border-4 border-white bg-[#1877F2] text-4xl font-bold text-white shadow-xl">
                            {selectedForum.name.charAt(0)}
                          </div>
                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <Badge className="rounded-full bg-[#1877F2]">
                                {selectedForum.visibility === "staff" ? "Forum prive" : "Forum public"}
                              </Badge>
                              <Badge variant="outline" className="rounded-full">{actor.clubName}</Badge>
                            </div>
                            <h1 className="text-3xl font-bold text-[#15233B]">{selectedForum.name}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {selectedForum.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-2">
                                {selectedForum.visibility === "staff" ? <Lock className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}
                                {selectedForum.visibility === "staff" ? "Acces bureau" : "Acces club"}
                              </span>
                              <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {selectedForum.memberCount} membres
                              </span>
                              <span className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                {stats?.postCount ?? 0} publications
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="rounded-full bg-[#1877F2] px-5 hover:bg-[#0f67dd]"
                          onClick={openComposer}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Creer une publication
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-0 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#DDE9FF] text-[#1877F2]">
                          {actor.firstName[0]}
                          {actor.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        onClick={openComposer}
                        className="flex-1 rounded-full bg-[#F3F6FA] px-5 py-3 text-left text-sm text-slate-500 hover:bg-[#E7EDF6]"
                      >
                        Forums du club {actor.clubName}
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {[
                        { key: "featured", label: "A la une" },
                        { key: "photos", label: "Photos" },
                        { key: "files", label: "Fichiers" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setFilter(item.key as FeedFilter)}
                          className={`rounded-full px-4 py-2 text-sm font-medium ${
                            filter === item.key
                              ? "bg-[#EEF4FF] text-[#1877F2]"
                              : "bg-[#F7F9FC] text-slate-500 hover:bg-[#EEF2F8]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {currentPosts.length === 0 ? (
                    <Card className="border-0 bg-white p-12 text-center shadow-sm">
                      <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
                      <h3 className="mt-4 text-lg font-semibold text-[#15233B]">Aucune publication</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Changez le filtre ou creez la premiere publication.
                      </p>
                    </Card>
                  ) : (
                    currentPosts.map((post) => (
                      <Card key={post.id} className="overflow-hidden border-0 p-0 shadow-sm">
                        {post.isPinned && (
                          <div className="flex items-center gap-2 bg-[#FFF6D8] px-5 py-3 text-sm text-[#916800]">
                            <Pin className="h-4 w-4" />
                            Publication epinglee
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-11 w-11">
                                <AvatarFallback className="bg-[#DDE9FF] text-[#1877F2]">
                                  {post.authorName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-[#15233B]">{post.authorName}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  <span>{formatDate(post.timestamp)}</span>
                                  <span>•</span>
                                  <span>{post.clubName}</span>
                                </div>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => togglePin(post.id)}>
                                  {post.isPinned ? "Retirer l epingle" : "Epingler"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editPost(post.id)}>Modifier</DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" onClick={() => deletePost(post.id)}>
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <h2 className="mt-4 text-xl font-bold text-[#15233B]">{post.title}</h2>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.body}</p>

                          {post.attachments && post.attachments.length > 0 && (
                            <div className="mt-4 rounded-3xl bg-[#F7F9FC] p-4">
                              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#15233B]">
                                <FileText className="h-4 w-4 text-[#1877F2]" />
                                Pieces jointes
                              </div>
                              <div className="space-y-3">
                                {post.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                                    <div>
                                      <p className="font-medium text-[#15233B]">{attachment.name}</p>
                                      <p className="text-sm text-slate-500">{attachment.type}</p>
                                    </div>
                                    <Badge variant="outline">{attachment.size ?? "Document"}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {filter === "photos" && post.attachments?.some((attachment) => attachment.type === "image") && (
                            <div className="mt-4 rounded-3xl bg-[#F7F9FC] p-4">
                              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#15233B]">
                                <ImageIcon className="h-4 w-4 text-[#1877F2]" />
                                Photos
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {post.attachments
                                  .filter((attachment) => attachment.type === "image")
                                  .map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="rounded-2xl bg-[linear-gradient(135deg,#d7e0ef_0%,#eef4fb_55%,#d7f3f0_100%)] p-5"
                                    >
                                      <p className="font-medium text-[#15233B]">{attachment.name}</p>
                                      <p className="mt-1 text-sm text-slate-500">Photo partagee dans le forum</p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} className="rounded-full bg-[#EEF4FF] text-[#1877F2]">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                            <div className="flex items-center gap-5">
                              <span className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-[#1877F2]" />
                                {post.reactions}
                              </span>
                              <span className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                {post.commentCount} commentaires
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                            <ActionButton icon={<ThumbsUp className="h-4 w-4" />} label="J'aime" />
                            <ActionButton icon={<MessageCircle className="h-4 w-4" />} label="Commenter" />
                            <ActionButton icon={<Send className="h-4 w-4" />} label="Partager" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </section>

                <aside className="space-y-5">
                  <Card className="border-0 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-[#15233B]">A propos</h3>
                    <div className="mt-4 space-y-4 text-sm text-slate-600">
                      <InfoRow icon={<Users className="h-4 w-4 text-[#1877F2]" />} text={`${selectedForum.memberCount} membres actifs`} />
                      <InfoRow icon={<MessageCircle className="h-4 w-4 text-[#1877F2]" />} text={`${stats?.postCount ?? 0} publications`} />
                      <InfoRow icon={<CalendarDays className="h-4 w-4 text-[#1877F2]" />} text="Fil centre sur les dernieres publications" />
                      <InfoRow
                        icon={selectedForum.visibility === "staff" ? <Lock className="h-4 w-4 text-[#1877F2]" /> : <Globe2 className="h-4 w-4 text-[#1877F2]" />}
                        text={selectedForum.visibility === "staff" ? "Espace reserve au bureau" : "Espace ouvert au club"}
                      />
                    </div>
                  </Card>

                  <Card className="border-0 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-[#15233B]">Statistiques rapides</h3>
                    <div className="mt-4 grid gap-3">
                      <QuickStat label="Reactions" value={stats?.reactions ?? 0} />
                      <QuickStat label="Commentaires" value={stats?.comments ?? 0} />
                    </div>
                  </Card>

                  <Card className="border-0 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-[#15233B]">Contacts</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] px-4 py-3 text-sm text-slate-600">
                        <Instagram className="h-4 w-4 text-[#1877F2]" />
                        <span>@{selectedForum.name.toLowerCase().replace(/\s+/g, "_")}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] px-4 py-3 text-sm text-slate-600">
                        <Linkedin className="h-4 w-4 text-[#1877F2]" />
                        <span>{actor.clubName} Community</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] px-4 py-3 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-[#1877F2]" />
                        <span>{actor.phone ?? "+33 6 12 34 56 78"}</span>
                      </div>
                    </div>
                  </Card>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingPostId ? "Modifier la publication" : "Creer une publication"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={newPostTitle} onChange={(event) => setNewPostTitle(event.target.value)} placeholder="Titre de la publication" />
            <Textarea value={newPostBody} onChange={(event) => setNewPostBody(event.target.value)} placeholder="Ecrivez votre message..." rows={7} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>Annuler</Button>
            <Button className="bg-[#1877F2] hover:bg-[#0f67dd]" onClick={publishPost}>
              {editingPostId ? "Enregistrer" : "Publier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-white/65">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#F7F9FC] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#15233B]">{value}</p>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <span>{text}</span>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#F3F6FA]"
    >
      {icon}
      {label}
    </button>
  );
}
