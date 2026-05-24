import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MenuItem } from "./components/MenuItem";
import {
  BookOpenCheck,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Users,
} from "lucide-react";
import { userMock } from "../../mock";
import {
  clearAuthenticatedUser,
  getAuthenticatedUser,
  syncUserMockWithApiUser,
} from "../../services/authService";
import { getUserById } from "../../services/userService";
import { getTrainingById } from "../../services/trainingService";
import { getFormById } from "../../services/formService";

type BreadcrumbItem = {
  label: string;
  path: string;
};

export default function Tamplate() {
  const { pathname, search } = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: "Painel", path: "/painel" },
  ]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const authenticatedUser = getAuthenticatedUser();

    if (authenticatedUser) {
      syncUserMockWithApiUser(authenticatedUser);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    buildBreadcrumbs(pathname, search, userMock.cargo).then((items) => {
      if (isCurrent) {
        setBreadcrumbs(items);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [pathname, search]);

  const menuItemsColaborador = [
    {
      label: "Início",
      link: "/painel",
    },
    {
      label: "Meu Perfil",
      link: "/painel/meu-perfil",
    },

    {
      label: "Meus Treinamentos",
      link: "/painel/treinamentos",
    },
    {
      label: "Sair",
      link: "/",
    },
  ];
  const menuItemsGerenciador = [
    {
      label: "Meu Perfil",
      link: "/painel/meu-perfil",
    },

    {
      label: "Colaboradores",
      link: "/painel/colaboradores",
    },
    {
      label: "Gerenciar Treinamentos",
      link: "/painel/gerenciar-treinamentos",
    },
    {
      label: "Sair",
      link: "/",
    },
  ];

  const menuItems =
    userMock.cargo === "colaborador"
      ? menuItemsColaborador
      : menuItemsGerenciador;

  const handleLogout = () => {
    clearAuthenticatedUser();
  };

  return (
    <div className="flex">
      <aside
        className={`sticky top-0 h-screen shrink-0 border-r border-zinc-300 bg-white transition-all duration-300 ${
          isSidebarCollapsed ? "w-18" : "w-75"
        }`}
      >
        <div className="flex h-20 items-center justify-between gap-3 border-b border-gray-300 px-4">
          {!isSidebarCollapsed && (
            <a
              href="#"
              className="block truncate text-3xl font-semibold text-gray-950"
            >
              Capacita NEES
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            className={`flex size-10 shrink-0 items-center justify-center rounded-md text-neutral-700 transition hover:bg-gray-100 hover:text-primary ${
              isSidebarCollapsed ? "mx-auto" : ""
            }`}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
        </div>
        <nav className="flex flex-col gap-1 pt-5">
          {menuItems.map((item) => (
            <MenuItem
              key={item.link}
              link={item.link}
              isActive={pathname === item.link}
              isCompact={isSidebarCollapsed}
              onClick={item.label === "Sair" ? handleLogout : undefined}
            >
              {item.label === "Sair" ? (
                <span
                  className={`flex items-center gap-3 ${
                    isSidebarCollapsed ? "justify-center" : ""
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {!isSidebarCollapsed && item.label}
                  <LogOut className="size-4" />
                </span>
              ) : (
                <span
                  className={
                    isSidebarCollapsed
                      ? "flex size-9 items-center justify-center rounded-md"
                      : ""
                  }
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {isSidebarCollapsed ? getMenuIcon(item.label) : item.label}
                </span>
              )}
            </MenuItem>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between gap-4 border-b border-gray-300 bg-white px-6">
          <nav className="flex min-w-0 flex-wrap items-center gap-1 text-sm md:text-base">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <span key={`${item.path}-${index}`} className="flex items-center gap-1">
                    {isLast ? (
                      <span className="max-w-80 truncate font-semibold text-black">
                        {item.label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(item.path)}
                        className="max-w-64 truncate rounded-md px-1 py-1 font-medium text-neutral-600 transition hover:bg-gray-100 hover:text-primary"
                      >
                        {item.label}
                      </button>
                    )}

                    {!isLast && (
                      <ChevronRight className="size-4 shrink-0 text-neutral-400" />
                    )}
                  </span>
                );
              })}
            </nav>

          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/painel/meu-perfil")}
              title="Meu Perfil"
              className="flex max-w-52 items-center gap-3 rounded-md px-2 py-1 text-left transition hover:bg-gray-100"
            >
              <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary-50 text-sm font-bold text-primary">
                {userMock.foto ? (
                  <img
                    src={userMock.foto}
                    alt={userMock.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getUserInitials(userMock.nome, userMock.sobrenome)
                )}
              </span>
              <span className="hidden min-w-0 flex-col md:flex">
                <span className="truncate text-sm font-semibold text-neutral-900">
                  {userMock.nome} {userMock.sobrenome}
                </span>
                <span className="truncate text-xs text-neutral-500">
                  {userMock.email}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleLogout();
                navigate("/");
              }}
              title="Sair"
              className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="size-4" />
              <span>Sair</span>
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

async function buildBreadcrumbs(
  pathname: string,
  search: string,
  cargo: string,
): Promise<BreadcrumbItem[]> {
  const isManager = cargo === "gerenciador";
  const base: BreadcrumbItem[] = [];
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/painel") {
    return isManager
      ? [{ label: "Gerenciar Treinamentos", path: "/painel/gerenciar-treinamentos" }]
      : [{ label: "Inicio", path: "/painel" }];
  }

  if (pathname === "/painel/meu-perfil") {
    return [...base, { label: "Meu Perfil", path: pathname }];
  }

  if (segments[1] === "colaboradores") {
    return buildCollaboratorsBreadcrumbs(base, pathname, segments);
  }

  if (segments[1] === "treinamentos") {
    return buildStudentTrainingsBreadcrumbs(base, pathname, segments);
  }

  if (segments[1] === "gerenciar-treinamentos") {
    return buildManagerTrainingsBreadcrumbs(base, pathname, search, segments);
  }

  return base;
}

async function buildCollaboratorsBreadcrumbs(
  base: BreadcrumbItem[],
  pathname: string,
  segments: string[],
) {
  const list = [...base, { label: "Colaboradores", path: "/painel/colaboradores" }];
  const detailOrAction = segments[2];

  if (!detailOrAction) {
    return list;
  }

  if (detailOrAction === "adicionar" || detailOrAction === "novo") {
    return [...list, { label: "Adicionar Colaborador", path: pathname }];
  }

  const userName = await getUserName(detailOrAction);

  return [...list, { label: userName, path: pathname }];
}

async function buildStudentTrainingsBreadcrumbs(
  base: BreadcrumbItem[],
  pathname: string,
  segments: string[],
) {
  const list = [...base, { label: "Meus Treinamentos", path: "/painel/treinamentos" }];
  const trainingId = segments[2];

  if (!trainingId) {
    return list;
  }

  const trainingName = await getTrainingName(trainingId);
  const trainingPath = `/painel/treinamentos/${trainingId}`;
  const nextSegment = segments[3];
  const formId = segments[4];

  if (!nextSegment) {
    return [...list, { label: trainingName, path: trainingPath }];
  }

  if (nextSegment === "formularios" && formId) {
    const formName = await getFormName(formId);

    return [
      ...list,
      { label: trainingName, path: trainingPath },
      { label: formName, path: pathname },
    ];
  }

  if (nextSegment === "resultado") {
    return [
      ...list,
      { label: trainingName, path: trainingPath },
      { label: "Resultados", path: pathname },
    ];
  }

  return [
    ...list,
    { label: trainingName, path: trainingPath },
    { label: "Responder Formulario", path: pathname },
  ];
}

async function buildManagerTrainingsBreadcrumbs(
  base: BreadcrumbItem[],
  pathname: string,
  search: string,
  segments: string[],
) {
  const list = [
    ...base,
    { label: "Gerenciar Treinamentos", path: "/painel/gerenciar-treinamentos" },
  ];
  const nextSegment = segments[2];

  if (!nextSegment) {
    return list;
  }

  if (nextSegment === "novo-treinamento") {
    if (segments[3] === "formularios") {
      return [
        ...list,
        { label: "Novo Treinamento", path: "/painel/gerenciar-treinamentos/novo-treinamento" },
        { label: "Formularios", path: pathname },
      ];
    }

    return [...list, { label: "Novo Treinamento", path: pathname }];
  }

  const trainingId = nextSegment;
  const trainingName = await getTrainingName(trainingId);
  const trainingPath = `/painel/gerenciar-treinamentos/${trainingId}`;
  const action = segments[3];

  if (!action) {
    return [...list, { label: trainingName, path: trainingPath }];
  }

  if (action === "adicionar-alunos") {
    return [
      ...list,
      { label: trainingName, path: trainingPath },
      { label: "Adicionar Alunos", path: pathname },
    ];
  }

  if (action === "formularios") {
    const params = new URLSearchParams(search);
    const formId = params.get("formId");
    const isNewForm = params.get("acao") === "novo";
    const formLabel = formId
      ? await getFormName(formId)
      : isNewForm
        ? "Adicionar Formulario"
        : "Formularios";

    return [
      ...list,
      { label: trainingName, path: trainingPath },
      { label: formLabel, path: pathname + search },
    ];
  }

  return [...list, { label: trainingName, path: trainingPath }];
}

async function getUserName(userId: string) {
  try {
    const user = await getUserById(userId);
    return `${user.name} ${user.lastName}`;
  } catch {
    return "Detalhes do Colaborador";
  }
}

async function getTrainingName(trainingId: string) {
  try {
    const training = await getTrainingById(trainingId);
    return training.title;
  } catch {
    return "Treinamento";
  }
}

async function getFormName(formId: string) {
  try {
    const form = await getFormById(formId);
    return form.title;
  } catch {
    return "Formulario";
  }
}

function getMenuIcon(label: string) {
  const iconClassName = "size-5";

  if (label === "Início") {
    return <LayoutDashboard className={iconClassName} />;
  }

  if (label === "Meu Perfil") {
    return <User className={iconClassName} />;
  }

  if (label === "Meus Treinamentos") {
    return <GraduationCap className={iconClassName} />;
  }

  if (label === "Colaboradores") {
    return <Users className={iconClassName} />;
  }

  if (label === "Gerenciar Treinamentos") {
    return <BookOpenCheck className={iconClassName} />;
  }

  return <ChevronRight className={iconClassName} />;
}

function getUserInitials(name?: string, lastName?: string) {
  const firstInitial = name?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();

  return initials || "U";
}
