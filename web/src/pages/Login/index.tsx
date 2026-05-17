import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "@heroui/react";
import type { Cargo } from "../../types/User";
import {
  login,
  mapUserRoleToCargo,
  saveAuthenticatedUser,
} from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState<Cargo>("colaborador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const authenticatedUser = await login({
        email,
        passWord: password,
      });

      saveAuthenticatedUser(authenticatedUser);

      const authenticatedRole = mapUserRoleToCargo(authenticatedUser.userRole);

      if (authenticatedRole === "colaborador") {
        navigate("/painel");
      } else {
        navigate("/painel/meu-perfil");
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setErrorMessage("Nao foi possivel conectar com a API. Verifique se o Spring esta rodando na porta 8080.");
      } else {
        setErrorMessage("E-mail ou senha invalidos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden p-0">
        <div className="bg-primary p-8 text-center">
          <h1 className="text-white text-3xl font-bold">Capacita NEES</h1>
        </div>

        <div className="p-8 bg-white">
          {/* TABS */}
          <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setRole("colaborador")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                role === "colaborador"
                  ? "bg-white shadow text-primary"
                  : "text-neutral-600"
              }`}
            >
              Colaborador
            </button>

            <button
              onClick={() => setRole("gerenciador")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                role === "gerenciador"
                  ? "bg-white shadow text-primary"
                  : "text-neutral-600"
              }`}
            >
              Gestor
            </button>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Entrar como {role === "gerenciador" ? "Gestor" : "Colaborador"}
            </h2>
            <p className="text-neutral-600 text-sm">
              Entre com suas credenciais
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 flex flex-col">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-50"
              required
            />

            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-50"
              required
            />

            {errorMessage && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-white font-semibold"
              isDisabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {role === "gerenciador" && (
            <div className="mt-5 text-center">
              <p className="text-sm text-neutral-600 mb-2">
                Primeiro acesso? Cadastre-se como gestor.
              </p>
              <Button
                className="bg-white text-primary border border-primary font-semibold px-6"
                onPress={() => navigate("/cadastro-gestor")}
              >
                Cadastrar-se
              </Button>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
