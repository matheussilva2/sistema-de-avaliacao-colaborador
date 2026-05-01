import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MenuItem } from "./components/MenuItem";
import { ArrowLeft, LogOut } from "lucide-react";
import { userMock } from "../../mock";


function getTitle(pathname: string) {
  if (pathname === "/painel") return "Início";
  if (pathname === "/painel/meu-perfil") return "Meu Perfil";
  if (pathname === "/painel/colaboradores") return "Colaboradores";

  if (
    pathname === "/painel/colaboradores/adicionar" ||
    pathname === "/painel/colaboradores/novo"
  ) {
    return "Adicionar Colaborador";
  }

  if (pathname.startsWith("/painel/colaboradores/")) {
    return "Detalhes do Colaborador";
  }

  if (pathname === "/painel/treinamentos") return "Treinamentos";

  return "Painel";
}

export default function Tamplate() {
  const { pathname } = useLocation();

  const navigate = useNavigate();

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

  const showBackButton = !menuItemsColaborador.some(
    (item) => item.link === pathname,
  );

  return (
    <div className="flex">
      <aside className="w-75 h-screen bg-white border-r border-zinc-300">
        <div className="border-b border-gray-300 py-6">
          <a
            href="#"
            className="block text-3xl w-full text-center font-semibold text-gray-950"
          >
            Capacita NEES
          </a>
        </div>
        <nav className="flex flex-col gap-1 pt-5">
          {menuItems.map((item) => (
            <MenuItem link={item.link} isActive={pathname === item.link}>
              {item.label === "Sair" ? (
                <span className="flex gap-3 items-center">
                  {item.label}
                  <LogOut className="size-4" />
                </span>
              ) : (
                <span>{item.label}</span>
              )}
            </MenuItem>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="py-7 border-b border-gray-300 text-lg font-semibold flex items-center px-6 bg-white">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="hover:text-gray-800 text-black flex gap-2 items-center hover:bg-gray-100 p-1 mr-2 rounded-md cursor-pointer"
            >
              <ArrowLeft className="size-5" />
              {/* <h1 className="text-lg font-semibold">{getTitle(pathname)}</h1> */}
            </button>
          )}

          <h1 className="text-lg font-semibold text-black">
            {getTitle(pathname)}
          </h1>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
