import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../lib/socket";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = getSocket(token);

    const handleNewNotification = (notification: { title: string; message: string; type: string }) => {
      toast.info(notification.title, {
        description: notification.message,
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [token, isAuthenticated]);

  return <>{children}</>;
}
