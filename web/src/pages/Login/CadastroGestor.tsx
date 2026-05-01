import { type ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Label, Button } from "@heroui/react";

export default function CadastroGestor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    empresa: "",
    senha: "",
    confirmarSenha: "",
  });

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Cadastro de gestor:", form);
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-primary p-8 text-white">
          <h1 className="text-3xl font-bold">Cadastro de Gestor</h1>
          <p className="mt-2 text-sm text-primary-100 max-w-2xl">
            Preencha os dados iniciais para criar a conta de gestor. Esse cadastro deve ser usado apenas no primeiro acesso.
          </p>
        </div>

        <div className="p-8 bg-white">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome" className="text-primary-700 font-semibold text-sm">
                Nome
              </Label>
              <Input
                id="nome"
                type="text"
                value={form.nome}
                onChange={(e) => handleFieldChange("nome", e.target.value)}
                placeholder="Digite o nome"
                className="bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sobrenome" className="text-gray-700 font-semibold text-sm">
                Sobrenome
              </Label>
              <Input
                id="sobrenome"
                type="text"
                value={form.sobrenome}
                onChange={(e) => handleFieldChange("sobrenome", e.target.value)}
                placeholder="Digite o sobrenome"
                className="bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="email@empresa.com"
                className="bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="telefone" className="text-gray-700 font-semibold text-sm">
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={form.telefone}
                onChange={(e) => handleFieldChange("telefone", e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
                className="bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="empresa" className="text-gray-700 font-semibold text-sm">
                Empresa
              </Label>
              <Input
                id="empresa"
                type="text"
                value={form.empresa}
                onChange={(e) => handleFieldChange("empresa", e.target.value)}
                placeholder="Nome da empresa"
                className="bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="senha" className="text-gray-700 font-semibold text-sm">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={form.senha}
                onChange={(e) => handleFieldChange("senha", e.target.value)}
                placeholder="••••••••"
                className="bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmarSenha" className="text-gray-700 font-semibold text-sm">
                Confirmar senha
              </Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={form.confirmarSenha}
                onChange={(e) => handleFieldChange("confirmarSenha", e.target.value)}
                placeholder="••••••••"
                className="bg-white"
              />
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 flex-col sm:flex-row">
            <Button className="bg-primary text-white px-8" onPress={handleSubmit}>
              Criar conta
            </Button>
            <Button className="bg-white text-primary border border-primary px-8" onPress={() => navigate("/")}>
              Voltar ao login
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
