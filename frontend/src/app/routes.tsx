import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";

import MemberDashboard from "./pages/member/Dashboard";
import MemberEvents from "./pages/member/Events";
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
import Profile from "./components/Profile";
import Notifications from "./components/Notifications";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "pending", Component: PendingApproval },

      { path: "admin/profile/:id", Component: Profile },
      { path: "staff/profile/:id", Component: Profile },
      { path: "president/profile/:id", Component: Profile },
      { path: "member/profile/:id", Component: Profile },

      { path: "admin/notifications", Component: Notifications },
      { path: "staff/notifications", Component: Notifications },
      { path: "president/notifications", Component: Notifications },
      { path: "member/notifications", Component: Notifications },
      { path: "admin/notifications/:id", Component: Notifications },
      { path: "staff/notifications/:id", Component: Notifications },
      { path: "president/notifications/:id", Component: Notifications },
      { path: "member/notifications/:id", Component: Notifications },

      { path: "member/dashboard", Component: MemberDashboard },
      { path: "member/events", Component: MemberEvents },
      { path: "member/chat", Component: MemberChat },
      { path: "member/forum", Component: MemberForum },
      { path: "member/profile", Component: MemberProfile },

      { path: "staff/dashboard", Component: StaffDashboard },
      { path: "staff/event/new", Component: EventRequestCreation },
      { path: "staff/events", Component: EventRequestsList },
      { path: "staff/channels", Component: ChannelManagement },
      { path: "staff/forum", Component: StaffForum },
      { path: "staff/profile", Component: StaffProfile },

      { path: "president/dashboard", Component: StaffDashboard },
      { path: "president/members", Component: MemberManagement },
      { path: "president/event/new", Component: EventRequestCreation },
      { path: "president/events", Component: EventRequestsList },
      { path: "president/channels", Component: ChannelManagement },
      { path: "president/forum", Component: StaffForum },
      { path: "president/profile", Component: StaffProfile },

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
