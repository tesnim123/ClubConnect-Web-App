import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface TopNavProps {
  userName: string;
  userAvatar?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function TopNav({ userName, userAvatar, notificationCount = 0, onNotificationClick }: TopNavProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1">
        {/* Breadcrumb or search could go here */}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={onNotificationClick}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#F5A623]">
              {notificationCount}
            </Badge>
          )}
        </Button>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-semibold text-[#1B2A4A]">{userName}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
