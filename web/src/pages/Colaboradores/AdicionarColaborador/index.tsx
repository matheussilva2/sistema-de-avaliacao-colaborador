import { type ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Label, Button } from "@heroui/react";
import { UserCircle2 } from "lucide-react";

export default function AdicionarColaborador() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    telefone: "",
    cargo: "colaborador",
    situacao: "Ativo",
    dataContratacao: "",
    dataRegistro: "",
  });
  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setPhotoFile(null);
      setPreviewUrl("");
      return;
    }

    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      situacao: form.situacao,
      foto: photoFile,
      dataRegistro: form.dataRegistro || new Date().toLocaleDateString("pt-BR"),
    };

    console.log("Salvar novo colaborador:", payload);
    navigate("/painel/colaboradores");
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Adicionar colaborador</h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados abaixo para cadastrar um novo colaborador.
          </p>
        </div>
        <Button
          className="bg-white text-primary border border-primary font-semibold px-6"
          onPress={() => navigate("/painel/colaboradores")}
        >
          Voltar à lista
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-4">
          <Card className="rounded-3xl bg-white shadow-sm p-6 flex flex-col items-center gap-6">
            <div className="w-40 h-40 rounded-full bg-primary-50 overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="text-primary-400 size-20" />
              )}
            </div>

            <div className="w-full">
              <Label className="text-primary-700 font-semibold text-sm mb-2 block">
                Foto de perfil
              </Label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-700 file:bg-primary-500 file:text-white file:px-4 file:py-2 file:rounded-full border border-gray-200 rounded-xl cursor-pointer"
              />
            </div>

            <p className="text-center text-sm text-gray-500">
              Envie uma foto para facilitar a identificação do colaborador.
            </p>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-8 space-y-6">
          <Card className="rounded-3xl bg-white shadow-sm overflow-hidden">
            <div className="bg-primary text-white px-6 py-4">
              <h2 className="font-semibold">Dados pessoais</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
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
                <Label htmlFor="sobrenome" className="text-primary-700 font-semibold text-sm">
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
                <Label htmlFor="cpf" className="text-primary-700 font-semibold text-sm">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  type="text"
                  value={form.cpf}
                  onChange={(e) => handleFieldChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-primary-700 font-semibold text-sm">
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
                <Label htmlFor="telefone" className="text-primary-700 font-semibold text-sm">
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
                <Label htmlFor="cargo" className="text-primary-700 font-semibold text-sm">
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  type="text"
                  value={form.cargo}
                  onChange={(e) => handleFieldChange("cargo", e.target.value)}
                  placeholder="Ex: colaborador"
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="situacao" className="text-primary-700 font-semibold text-sm">
                  Situação
                </Label>
                <select
                  id="situacao"
                  value={form.situacao}
                  onChange={(e) => handleFieldChange("situacao", e.target.value)}
                  className="bg-white border rounded-xl h-10 px-3"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dataContratacao" className="text-primary-700 font-semibold text-sm">
                  Data de contratação
                </Label>
                <Input
                  id="dataContratacao"
                  type="date"
                  value={form.dataContratacao}
                  onChange={(e) => handleFieldChange("dataContratacao", e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dataRegistro" className="text-primary-700 font-semibold text-sm">
                  Data de registro
                </Label>
                <Input
                  id="dataRegistro"
                  type="date"
                  value={form.dataRegistro}
                  onChange={(e) => handleFieldChange("dataRegistro", e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-primary text-white px-8" onPress={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
