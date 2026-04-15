import { Outlet, useLocation } from "react-router-dom";
import { MenuItem } from "./components/MenuItem";

type TemplateGestorProps = {
    titulo: string;
}

export default function({ titulo }: TemplateGestorProps) {
    const {pathname} = useLocation();

    const menuItemsAdmin = [
        {
            label: "Início",
            link: "/painel"
        },
        {
            label: "Meu Perfil",
            link: "/painel/meu-perfil"
        },
        {
            label: "Colaboradores",
            link: "/painel/colaboradores"
        },
        {
            label: "Treinamentos",
            link: "/painel/treinamentos"
        },
        {
            label: "Gerenciar Treinamento",
            link: "/painel/gerenciar-treinamentos"
        },
        {
            label: "Sair",
            link: "/painel/sair"
        },
    ];

    const menuItems = [
        {
            label: "Início",
            link: "/painel"
        },
        {
            label: "Meu Perfil",
            link: "/painel/meu-perfil"
        },
        {
            label: "Treinamentos",
            link: "/painel/treinamentos"
        },
        {
            label: "Sair",
            link: "/painel/sair"
        },
    ];

    return (
        <div className="flex">
            <aside className="w-75 h-screen bg-white border-r border-zinc-300">
                <div className="border-b border-gray-300 py-6">
                    <a href="#" className="block text-3xl w-full text-center font-semibold text-gray-950">
                        Capacita NEES
                    </a>
                </div>
                <nav className="flex flex-col gap-1 pt-5">
                    {
                        menuItems.map((item) => (
                            <MenuItem
                                link={item.link}
                                label={item.label}
                                isActive={pathname === item.link}
                            />
                        ))
                    }
                </nav>
            </aside>
            <div className="flex-1">
                <header className="py-7 border-b border-gray-300 text-lg font-semibold flex items-center px-6 bg-white">
                    <h1 className="text-lg font-semibold">{titulo}</h1>
                </header>
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}