import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MenuItem } from "./components/MenuItem";
import { useAuth } from "../../providers/AuthProvider";
import { useEffect } from "react";

type TemplateGestorProps = {
    titulo: string;
}

export default function({ titulo }: TemplateGestorProps) {
    const {pathname} = useLocation();
    const navigate = useNavigate();

    const {user, loading, logout} = useAuth();

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
            label: "Colaboradores",
            link: "/painel/colaboradores",
            permission: "manage_users"
        },
        {
            label: "Treinamentos",
            link: "/painel/treinamentos"
        },
        {
            label: "Gerenciar Treinamento",
            link: "/painel/gerenciar-treinamentos",
            permission: "manage_trainings"
        }
    ];

    useEffect(() => {
        if(!user && !loading) {
            navigate('/');
        }
    }, [user, loading]);

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
                        menuItems.map((item) => {
                            if(item.permission) {
                                if(user?.permissoes.includes(item.permission)){
                                    return <MenuItem
                                            link={item.link}
                                            label={item.label}
                                            isActive={pathname === item.link}
                                        />
                                }
                            } else {
                                return <MenuItem
                                            link={item.link}
                                            label={item.label}
                                            isActive={pathname === item.link}
                                        />;
                            }
                        })
                    }
                    <button
                        className={
                            `w-full h-12 px-5 bg-white text-gray-950 text-left cursor-pointer`
                        }
                        onClick={logout}>
                        <span>Sair</span>
                    </button>
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