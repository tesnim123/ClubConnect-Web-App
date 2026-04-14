import { createBrowserRouter } from "react-router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PendingApproval from "./pages/PendingApproval";
import Signup from "./pages/Signup";
import AdminClubDetails from "./pages/admin/ClubDetails";
import AdminCommunication from "./pages/admin/Communication";
import CreateClub from "./pages/admin/Create_club";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEventRequests from "./pages/admin/EventRequests";
import AdminForums from "./pages/admin/Forums";
import ClubsManagement from "./pages/admin/ClubsManagement";
import AdminMemberManagement from "./pages/admin/MemberManagement";
import AdminNotifications from "./pages/admin/NotificationsAdmin";
import AdminProfile from "./pages/admin/ProfileAdmin";
import AdminSettings from "./pages/admin/SettingsAdmin";
import Statistics from "./pages/admin/Statistics";
import MemberChat from "./pages/member/Chat";
import MemberDashboard from "./pages/member/Dashboard";
import MemberEvents from "./pages/member/Events";
import MemberForum from "./pages/member/Forum";
import MemberProfile from "./pages/member/Profile";
import PresidentChannelManagement from "./pages/president/ChannelManagement";
import PresidentDashboard from "./pages/president/Dashboard";
import PresidentEventRequestCreation from "./pages/president/EventRequestCreation";
import PresidentEventRequestsList from "./pages/president/EventRequestsList";
import PresidentForum from "./pages/president/Forum";
import PresidentMemberManagement from "./pages/president/MemberManagement";
import PresidentProfile from "./pages/president/Profile";
import StaffChannelManagement from "./pages/staff/ChannelManagement";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffEventRequestCreation from "./pages/staff/EventRequestCreation";
import StaffEventRequestsList from "./pages/staff/EventRequestsList";
import StaffForum from "./pages/staff/Forum";
import StaffProfile from "./pages/staff/Profile";

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
              { path: "member/dashboard", Component: MemberDashboard },
              { path: "member/events", Component: MemberEvents },
              { path: "member/chat", Component: MemberChat },
              { path: "member/forum", Component: MemberForum },
              { path: "member/profile", Component: MemberProfile },
              { path: "member/profile/:id", Component: MemberProfile },
            ],
          },
          {
            Component: () => <ProtectedRoute allowedRoles={["STAFF"]} />,
            children: [
              { path: "staff/dashboard", Component: StaffDashboard },
              { path: "staff/event/new", Component: StaffEventRequestCreation },
              { path: "staff/events", Component: StaffEventRequestsList },
              { path: "staff/channels", Component: StaffChannelManagement },
              { path: "staff/forum", Component: StaffForum },
              { path: "staff/profile", Component: StaffProfile },
              { path: "staff/profile/:id", Component: StaffProfile },
            ],
          },
          {
            Component: () => <ProtectedRoute allowedRoles={["PRESIDENT"]} />,
            children: [
              { path: "president/dashboard", Component: PresidentDashboard },
              { path: "president/members", Component: PresidentMemberManagement },
              { path: "president/event/new", Component: PresidentEventRequestCreation },
              { path: "president/events", Component: PresidentEventRequestsList },
              { path: "president/channels", Component: PresidentChannelManagement },
              { path: "president/forum", Component: PresidentForum },
              { path: "president/profile", Component: PresidentProfile },
              { path: "president/profile/:id", Component: PresidentProfile },
            ],
          },
          {
            Component: () => <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              { path: "admin/dashboard", Component: AdminDashboard },
              { path: "admin/clubs", Component: ClubsManagement },
              { path: "admin/clubs/create", Component: CreateClub },
              { path: "admin/clubs/:id", Component: AdminClubDetails },
              { path: "admin/members", Component: AdminMemberManagement },
              { path: "admin/events", Component: AdminEventRequests },
              { path: "admin/communication", Component: AdminCommunication },
              { path: "admin/forums", Component: AdminForums },
              { path: "admin/statistics", Component: Statistics },
              { path: "admin/profile/:id", Component: AdminProfile },
              { path: "admin/settings/:id", Component: AdminSettings },
              { path: "admin/notifications/:id", Component: AdminNotifications },
            ],
          },
          { path: ":role/settings/:id", Component: Settings },
          { path: ":role/notifications/:id", Component: Notifications },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
