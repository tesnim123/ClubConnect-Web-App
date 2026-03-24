import { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, forumPosts } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Search, Plus, ThumbsUp, MessageCircle, Pin, File } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MemberForum() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={`${currentUser.firstName} ${currentUser.lastName}`}
          userAvatar={currentUser.avatar}
          notificationCount={3}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Forum</h1>
                <p className="text-gray-600">Forum {currentUser.clubName}</p>
              </div>
              <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau post
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans le forum..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Forum Posts */}
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar className="flex-shrink-0">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {post.isPinned && (
                              <Pin className="w-4 h-4 text-[#F5A623]" />
                            )}
                            <h3 className="font-bold text-lg text-[#1B2A4A]">{post.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-semibold">{post.authorName}</span>
                            <span>•</span>
                            <span className="font-mono">
                              {format(new Date(post.timestamp), 'PPP', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-3">{post.body}</p>

                      {post.attachments && post.attachments.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {post.attachments.map((file) => (
                            <div
                              key={file.id}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 rounded border border-red-200 mr-2"
                            >
                              <File className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-900">{file.name}</span>
                              <span className="text-xs text-red-700">{file.size}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-[#0EA8A8]">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{post.reactions}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-[#0EA8A8]">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
