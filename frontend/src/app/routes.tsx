// routes.tsx
import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";

import MemberDashboard from "./pages/member/Dashboard";
import MemberEvents from "./pages/member/Events";
 // Ajout de l'import
import MemberChat from "./pages/member/Chat";
import MemberForum from "./pages/member/Forum";
import MemberProfile from "./pages/member/Profile";

import StaffDashboard from "./pages/staff/Dashboard";
import MemberManagement from "./pages/staff/MemberManagement";
import EventRequestCreation from "./pages/staff/EventRequestCreation";
import EventRequestsList from "./pages/staff/EventRequestsList";
import ChannelManagement from "./pages/staff/ChannelManagement";
import StaffForum from "./pages/staff/Forum";
import StaffProfile from "./pages/staff/Profile";
import PresidentDashboard from "./pages/president/Dashboard";
import PresidentMemberManagement from "./pages/president/MemberManagement";
import PresidentEventRequestCreation from "./pages/president/EventRequestCreation";
import PresidentEventRequestsList from "./pages/president/EventRequestsList";
import PresidentChannelManagement from "./pages/president/ChannelManagement";
import PresidentForum from "./pages/president/Forum";
import PresidentProfile from "./pages/president/Profile";
import PresidentSettings from "./pages/president/Settings";
import PresidentNotifications from "./pages/president/Notifications";

import AdminDashboard from "./pages/admin/Dashboard";
import ClubsManagement from "./pages/admin/ClubsManagement";
import AdminMemberManagement from "./pages/admin/MemberManagement";
import AdminEventRequests from "./pages/admin/EventRequests";
import AdminCommunication from "./pages/admin/Communication";
import AdminForums from "./pages/admin/Forums";
import Statistics from "./pages/admin/Statistics";
import CreateClub from "./pages/admin/Create_club";
import ClubDetails from "./pages/admin/ClubDetails";

import NotFound from "./pages/NotFound";
import Settings from "./components/Settings";
import Notifications from "./components/Notifications";
import AdminProfile from "./pages/admin/ProfileAdmin";
import AdminSettings from "./pages/admin/SettingsAdmin";
import AdminNotifications from "./pages/admin/NotificationsAdmin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "pending", Component: PendingApproval },

      // Profile routes with role prefix and dynamic ID
      { path: "admin/profile/:id", Component: AdminProfile },
      { path: "staff/profile/:id", Component: StaffProfile },
      { path: "president/profile/:id", Component: PresidentProfile },
      { path: "member/profile/:id", Component: MemberProfile },

      // Settings routes with role prefix and dynamic ID
      { path: "admin/settings/:id", Component: AdminSettings },
      { path: "president/settings/:id", Component: PresidentSettings },
      { path: ":role/settings/:id", Component: Settings },

      // Notifications routes with role prefix and dynamic ID
      { path: "admin/notifications/:id", Component: AdminNotifications },
      { path: "president/notifications/:id", Component: PresidentNotifications },
      { path: ":role/notifications/:id", Component: Notifications },

      // Member routes
      { path: "member/dashboard", Component: MemberDashboard },
      { path: "member/events", Component: MemberEvents },
      // Nouvelle route pour les détails
      { path: "member/chat", Component: MemberChat },
      { path: "member/forum", Component: MemberForum },
      { path: "member/profile", Component: MemberProfile },

      // Staff routes
      { path: "staff/dashboard", Component: StaffDashboard },
      { path: "staff/event/new", Component: EventRequestCreation },
      { path: "staff/events", Component: EventRequestsList },
      { path: "staff/channels", Component: ChannelManagement },
      { path: "staff/forum", Component: StaffForum },
      { path: "staff/profile", Component: StaffProfile },

      // President routes
      { path: "president/dashboard", Component: PresidentDashboard },
      { path: "president/members", Component: PresidentMemberManagement },
      { path: "president/event/new", Component: PresidentEventRequestCreation },
      { path: "president/events", Component: PresidentEventRequestsList },
      { path: "president/channels", Component: PresidentChannelManagement },
      { path: "president/forum", Component: PresidentForum },
      { path: "president/profile", Component: PresidentProfile },

      // Admin routes
      { path: "admin/dashboard", Component: AdminDashboard },
      { path: "admin/clubs", Component: ClubsManagement },
      { path: "admin/clubs/create", Component: CreateClub },
      { path: "admin/clubs/:id", Component: ClubDetails },
      { path: "admin/members", Component: AdminMemberManagement },
      { path: "admin/events", Component: AdminEventRequests },
      { path: "admin/communication", Component: AdminCommunication },
      { path: "admin/forums", Component: AdminForums },
      { path: "admin/statistics", Component: Statistics },

      { path: "*", Component: NotFound },
    ],
  },
]);
