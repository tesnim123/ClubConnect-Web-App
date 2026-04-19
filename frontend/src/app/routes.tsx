import { createBrowserRouter } from "react-router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PendingApproval from "./pages/PendingApproval";
import Signup from "./pages/Signup";
import ClubsManagement from "./pages/admin/ClubsManagement";
import CreateClub from "./pages/admin/Create_club";
import AdminClubDetails from "./pages/admin/ClubDetails";
import RoleDashboard from "./pages/shared/RoleDashboard";
import PresidentMembersPage from "./pages/shared/PresidentMembersPage";
import ChannelsPage from "./pages/shared/ChannelsPage";
import ForumPage from "./pages/shared/ForumPage";
import PublicEventsPage from "./pages/shared/PublicEventsPage";
import AdminModerationPage from "./pages/shared/AdminModerationPage";
import ProfileSettingsPage from "./pages/shared/ProfileSettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "pending", Component: PendingApproval },
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: () => <ProtectedRoute allowedRoles={["MEMBER"]} />,
            children: [
              { path: "member/dashboard", Component: RoleDashboard },
              { path: "member/events", Component: PublicEventsPage },
              { path: "member/chat", Component: ChannelsPage },
              { path: "member/forum", Component: ForumPage },
              { path: "member/profile", Component: ProfileSettingsPage },
              { path: "member/profile/:id", Component: ProfileSettingsPage },
            ],
          },
          {
            Component: () => <ProtectedRoute allowedRoles={["STAFF"]} />,
            children: [
              { path: "staff/dashboard", Component: RoleDashboard },
              { path: "staff/event/new", Component: ForumPage },
              { path: "staff/events", Component: PublicEventsPage },
              { path: "staff/channels", Component: ChannelsPage },
              { path: "staff/forum", Component: ForumPage },
              { path: "staff/profile", Component: ProfileSettingsPage },
              { path: "staff/profile/:id", Component: ProfileSettingsPage },
            ],
          },
          {
            Component: () => <ProtectedRoute allowedRoles={["PRESIDENT", "VICE_PRESIDENT"]} />,
            children: [
              { path: "president/dashboard", Component: RoleDashboard },
              { path: "president/members", Component: PresidentMembersPage },
              { path: "president/event/new", Component: ForumPage },
              { path: "president/events", Component: PublicEventsPage },
              { path: "president/channels", Component: ChannelsPage },
              { path: "president/forum", Component: ForumPage },
              { path: "president/profile", Component: ProfileSettingsPage },
              { path: "president/profile/:id", Component: ProfileSettingsPage },
            ],
          },
          {
            Component: () => <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              { path: "admin/dashboard", Component: RoleDashboard },
              { path: "admin/clubs", Component: ClubsManagement },
              { path: "admin/clubs/create", Component: CreateClub },
              { path: "admin/clubs/:id", Component: AdminClubDetails },
              { path: "admin/members", Component: RoleDashboard },
              { path: "admin/events", Component: AdminModerationPage },
              { path: "admin/communication", Component: ChannelsPage },
              { path: "admin/forums", Component: AdminModerationPage },
              { path: "admin/statistics", Component: RoleDashboard },
              { path: "admin/profile/:id", Component: ProfileSettingsPage },
              { path: "admin/settings/:id", Component: ProfileSettingsPage },
              { path: "admin/notifications/:id", Component: ProfileSettingsPage },
            ],
          },
          { path: ":role/settings/:id", Component: ProfileSettingsPage },
          { path: ":role/notifications/:id", Component: ProfileSettingsPage },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
