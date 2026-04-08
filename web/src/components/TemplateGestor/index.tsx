type TemplateGestorProps = {
    titulo: string;
    children: React.ReactNode
}

export default function({ titulo, children }: TemplateGestorProps) {
    const paginaAtual = "Colaboradores";

    const itemsMenu = [
        {
            label: "Início",
            link: "#"
        },
        {
            label: "Colaboradores",
            link: "#"
        },
        {
            label: "Treinamento",
            link: "#"
        },
    ];

    return (
        <div className="flex">
            <aside className="w-75 h-screen bg-gray-950">
                <div className="border-b border-gray-300 py-4">
                    <a href="#" className="block text-2xl w-full text-center font-semibold text-white">
                        Capacita NEES
                    </a>
                </div>
                <nav className="flex flex-col gap-1 pt-5">
                    {
                        itemsMenu.map((item) => (
                            <a
                                className={
                                    `flex items-center w-full h-12 px-5 ${item.label === paginaAtual ? "bg-white text-gray-950" : "text-white"}`
                                }
                                href={item.link}>
                                <span>{item.label}</span>
                            </a>
                            
                        ))
                    }
                </nav>
            </aside>
            <div className="flex-1">
                <header className="h-20 border-b border-gray-400 text-lg font-semibold flex items-center px-6 bg-white">
                    <h1 className="text-lg font-semibold">{titulo}</h1>
                </header>
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}