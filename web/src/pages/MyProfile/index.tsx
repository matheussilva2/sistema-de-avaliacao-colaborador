import { type ChangeEvent, useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { userMock } from "../../mock";

export const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(userMock);

  const handleChange = (field: string, value: string) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUser((prev) => ({
      ...prev,
      foto: imageUrl,
    }));
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="flex gap-6 mb-8">
        {/* PERFIL */}
        <div className="w-64">
          <Card className="bg-primary-50 rounded-xl shadow-md p-6 flex flex-col items-center gap-4">
            <img
              width={120}
              height={120}
              className="rounded-full border-4 border-primary object-cover"
              src={user.foto ?? "https://picsum.photos/seed/placeholder/500/500"}
              alt="Profile"
            />

            <div className="text-center">
              <span className="block text-primary-700 text-lg font-bold">
                {user.nome} {user.sobrenome}
              </span>
              <span className="block text-neutral-600 text-sm">
                {user.cargo === "gerenciador" ? "Gerenciador" : "Colaborador"}
              </span>
            </div>

            {isEditing && (
              <label className="cursor-pointer rounded-full border border-primary px-4 py-2 text-primary text-sm hover:bg-primary/10">
                Alterar foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </Card>
        </div>

        {/* DADOS */}
        <div className="flex-1">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <div className="bg-primary p-4">
              <span className="text-white font-semibold">Dados Pessoais</span>
            </div>

            <div className="bg-primary-50 p-6">
              <form className="grid grid-cols-2 gap-4">
                <Input
                  disabled={!isEditing}
                  value={user.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  placeholder="Nome"
                />

                <Input
                  disabled={!isEditing}
                  value={user.sobrenome}
                  onChange={(e) => handleChange("sobrenome", e.target.value)}
                  placeholder="Sobrenome"
                />

                <Input
                  disabled={!isEditing}
                  value={user.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  placeholder="Telefone"
                />
              </form>

              <Button
                onPress={() => {
                  if (isEditing) {
                    console.log("SALVO:", user);
                  }
                  setIsEditing(!isEditing);
                }}
                className="w-full bg-primary text-white mt-6"
              >
                {isEditing ? "Salvar Alterações" : "Editar Dados"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
