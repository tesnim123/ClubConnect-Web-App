import { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser, channels, messages, members } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Hash, Lock, Users, Send, Paperclip, Smile, File } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MemberChat() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [messageInput, setMessageInput] = useState("");
  const channelMessages = messages.filter(m => m.channelId === selectedChannel.id);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Send message:', messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={`${currentUser.firstName} ${currentUser.lastName}`}
          userAvatar={currentUser.avatar}
          notificationCount={3}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Channel List */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-[#1B2A4A]">Canaux</h2>
              <p className="text-sm text-gray-600">{currentUser.clubName}</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedChannel.id === channel.id
                        ? 'bg-[#0EA8A8]/10 text-[#0EA8A8]'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {channel.isPrivate ? (
                      <Lock className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Hash className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate">{channel.name}</span>
                    {channel.unreadCount > 0 && (
                      <Badge className="bg-[#F5A623] h-5 min-w-5 px-1">{channel.unreadCount}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col bg-[#F7F8FC]">
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedChannel.isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <Hash className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <h3 className="font-bold text-[#1B2A4A]">{selectedChannel.name}</h3>
                  <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                {selectedChannel.members.length} membres
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {channelMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1B2A4A]">{message.senderName}</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <Card className="inline-block p-3 bg-white max-w-2xl">
                        <p className="text-gray-800">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200"
                              >
                                <File className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-semibold text-red-900 flex-1">{file.name}</span>
                                <span className="text-xs text-red-700">{file.size}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                      {message.reactions && (
                        <div className="flex gap-1 mt-1">
                          {message.reactions.map((reaction, idx) => (
                            <button
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
                            >
                              {reaction.emoji} {reaction.count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="w-5 h-5" />
                </Button>
                <Input
                  placeholder={`Envoyer un message dans #${selectedChannel.name}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-[#0EA8A8] hover:bg-[#0c8e8e]"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Members Sidebar */}
          <div className="w-64 bg-white border-l border-gray-200">
            <div className="p-4 border-b">
              <h3 className="font-bold text-[#1B2A4A]">Membres</h3>
              <p className="text-sm text-gray-600">{selectedChannel.members.length} en ligne</p>
            </div>
            <ScrollArea className="p-4">
              <div className="space-y-3">
                {members.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.firstName[0]}</AvatarFallback>
                      </Avatar>
                      {member.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1B2A4A] truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
