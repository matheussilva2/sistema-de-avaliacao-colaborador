import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "@heroui/react";
import { useAuth } from "../../providers/AuthProvider";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { user, loading, login } = useAuth();

    useEffect(() => {
        if(user && !loading) {
            navigate('/painel');
        }
    }, [loading]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        login(email, password);

        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-white flex items-center justify-center">
            <Card className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden p-0">
                <div className="bg-primary p-8 text-center">
                    <h1 className="text-white text-3xl font-bold">Capacita NEES</h1>
                </div>

                <div className="p-8 bg-white">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Entrar na conta</h2>
                        <p className="text-neutral-600 text-sm">Entre com suas credenciais</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-primary-700 font-semibold text-sm">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-neutral-50"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-primary-700 font-semibold text-sm">
                                Senha
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-neutral-50"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                            isDisabled={isLoading}
                        >
                            {isLoading ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-neutral-200">
                        <p className="text-center text-neutral-600 text-xs">
                            Caso tenha esquecido a senha,{" "}
                            <a href="#" className="text-primary font-semibold hover:text-primary-600">
                                entre em contato
                            </a>
                        </p>
                    </div>
                </div>
            </Card>
        </main>
    );
}