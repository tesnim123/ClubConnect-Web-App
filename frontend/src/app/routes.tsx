import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";

// Member pages
import MemberDashboard from "./pages/member/Dashboard";
import MemberEvents from "./pages/member/Events";
import MemberChat from "./pages/member/Chat";
import MemberForum from "./pages/member/Forum";
import MemberProfile from "./pages/member/Profile";

// Staff pages
import StaffDashboard from "./pages/staff/Dashboard";
import MemberManagement from "./pages/staff/MemberManagement";
import EventRequestCreation from "./pages/staff/EventRequestCreation";
import EventRequestsList from "./pages/staff/EventRequestsList";
import ChannelManagement from "./pages/staff/ChannelManagement";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import ClubsManagement from "./pages/admin/ClubsManagement";
import AdminMemberManagement from "./pages/admin/MemberManagement";
import AdminEventRequests from "./pages/admin/EventRequests";
import AdminCommunication from "./pages/admin/Communication";
import AdminForums from "./pages/admin/Forums";
import Statistics from "./pages/admin/Statistics";

import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "pending", Component: PendingApproval },
      
      // Member routes
      { path: "member/dashboard", Component: MemberDashboard },
      { path: "member/events", Component: MemberEvents },
      { path: "member/chat", Component: MemberChat },
      { path: "member/forum", Component: MemberForum },
      { path: "member/profile", Component: MemberProfile },
      
      // Staff routes
      { path: "staff/dashboard", Component: StaffDashboard },
      { path: "staff/members", Component: MemberManagement },
      { path: "staff/event/new", Component: EventRequestCreation },
      { path: "staff/events", Component: EventRequestsList },
      { path: "staff/channels", Component: ChannelManagement },
      
      // Admin routes
      { path: "admin/dashboard", Component: AdminDashboard },
      { path: "admin/clubs", Component: ClubsManagement },
      { path: "admin/members", Component: AdminMemberManagement },
      { path: "admin/events", Component: AdminEventRequests },
      { path: "admin/communication", Component: AdminCommunication },
      { path: "admin/forums", Component: AdminForums },
      { path: "admin/statistics", Component: Statistics },
      
      { path: "*", Component: NotFound },
    ],
  },
]);
