import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { getDictionary } from "@/dictionaries";

import Container from "../components/ui/Container";
import LoadingBox from "./components/loading-box";
import { MetricsSummaryCard } from "./components/MetricsSummaryCard";
import { EntityBreakdown } from "./components/EntityBreakdown";

import {
  getTasksCount,
  getUsersTasksCount,
} from "@/actions/dashboard/get-tasks-count";
import { getModules } from "@/actions/get-modules";
import { getEmployees } from "@/actions/get-empoloyees"; // Preserving typo from file system
import { getBoardsCount } from "@/actions/dashboard/get-boards-count";
import { getStorageSize } from "@/actions/documents/get-storage-size";
import { getDocumentsCount } from "@/actions/dashboard/get-documents-count";
import { getActiveUsersCount } from "@/actions/dashboard/get-active-users-count";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const userId = session?.user?.id;
  const lang = session?.user?.userLanguage;
  const dict = await getDictionary(lang as "en" | "cs" | "de" | "uk");

  // Fetch all CMS data
  const [
    modules,
    tasks,
    // employees, // File existence uncertain, will import from known location
    storage,
    projects,
    users,
    documents,
    usersTasks,
  ] = await Promise.all([
    getModules(),
    getTasksCount(),
    // getEmployees(),
    getStorageSize(),
    getBoardsCount(),
    getActiveUsersCount(),
    getDocumentsCount(),
    getUsersTasksCount(userId),
  ]);

  // Module checks
  const projectsModule = modules.find((module) => module.name === "projects");
  const documentsModule = modules.find((module) => module.name === "documents");
  // const employeesModule = modules.find((module) => module.name === "employees");

  // Build project entities
  const projectEntities = [];
  if (projectsModule?.enabled) {
    projectEntities.push(
      { name: "Projects", value: projects, href: "/projects", iconName: "FolderKanban", color: "cyan" as const },
      { name: "All Tasks", value: tasks, href: "/projects/tasks", iconName: "CheckSquare", color: "violet" as const },
      { name: "My Tasks", value: usersTasks, href: `/projects/tasks/${userId}`, iconName: "Target", color: "emerald" as const },
    );
  }

  // Storage percentage
  const maxStorageMB = 10240; // 10GB in MB
  const storagePercentage = Math.min((storage / maxStorageMB) * 100, 100);

  return (
    <Container
      title={dict.DashboardPage.containerTitle}
      description={dict.DashboardPage.containerDescription}
    >
      {/* Top Metrics Row */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Suspense fallback={<LoadingBox />}>
          <MetricsSummaryCard
            title={dict.DashboardPage.activeUsers}
            value={users}
            subtitle="Team members"
            iconName="Users2"
            accentColor="violet"
          />
        </Suspense>

        <Suspense fallback={<LoadingBox />}>
          <MetricsSummaryCard
            title="My Pending Tasks"
            value={usersTasks}
            subtitle={`of ${tasks} total tasks`}
            iconName="Zap"
            accentColor="amber"
          />
        </Suspense>

        {/* Placeholder for future CMS metrics */}
        <Suspense fallback={<LoadingBox />}>
          <MetricsSummaryCard
            title="Documents"
            value={documents}
            subtitle="Total files"
            iconName="FileText"
            accentColor="cyan"
          />
        </Suspense>

        <Suspense fallback={<LoadingBox />}>
          <MetricsSummaryCard
            title="Storage"
            value={`${Math.round(storage)} MB`}
            subtitle={`${storagePercentage.toFixed(1)}% used`}
            iconName="HardDrive"
            accentColor={storagePercentage > 80 ? "rose" : "emerald"}
          />
        </Suspense>
      </div>

      {/* Entity Breakdowns */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
        {projectsModule?.enabled && projectEntities.length > 0 && (
          <Suspense fallback={<LoadingBox />}>
            <EntityBreakdown
              title="Projects & Tasks"
              entities={projectEntities}
            />
          </Suspense>
        )}
      </div>

    </Container>
  );
};

export default DashboardPage;
