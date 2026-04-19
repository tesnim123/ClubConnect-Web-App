import type { PropsWithChildren, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useAuth } from "../context/AuthContext";
import { getRoleLabel, getRoleSection } from "../lib/role";

type AppShellProps = PropsWithChildren<{
  title: string;
  description?: string;
  actions?: ReactNode;
  sectionOverride?: "admin" | "president" | "staff" | "member";
}>;

export function AppShell({ title, description, actions, sectionOverride, children }: AppShellProps) {
  const { user } = useAuth();
  const section = sectionOverride || getRoleSection(user?.role);

  return (
    <div className="flex h-screen bg-[#F7F8FC]">
      <Sidebar role={section} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          userId={user?._id}
          userName={user?.name ?? "Utilisateur"}
          userRole={getRoleLabel(user?.role)}
          userRoleType={section}
          notificationCount={0}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#10233F]">{title}</h1>
              {description ? <p className="mt-2 text-gray-600">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
