import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Label } from "@heroui/react";
import { UserCircle2 } from "lucide-react";
import {
  getAuthenticatedUser,
  saveAuthenticatedUser,
  syncUserMockWithApiUser,
  type ApiUser,
  type ApiUserRole,
} from "../../services/authService";
import { updateUser, updateUserPhoto } from "../../services/userService";

export const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [loggedUser, setLoggedUser] = useState<ApiUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    cpf: "",
    userRole: "EMPLOYEE" as ApiUserRole,
    active: true,
    passWord: "",
  });

  useEffect(() => {
    const authenticatedUser = getAuthenticatedUser();

    if (!authenticatedUser) {
      setErrorMessage("Nenhum usuario logado foi encontrado.");
      return;
    }

    setLoggedUser(authenticatedUser);
    setForm({
      name: authenticatedUser.name,
      lastName: authenticatedUser.lastName,
      email: authenticatedUser.email,
      phone: authenticatedUser.phone,
      cpf: authenticatedUser.cpf,
      userRole: authenticatedUser.userRole,
      active: authenticatedUser.active,
      passWord: "",
    });

    setPhotoPreview(authenticatedUser.profilePhoto ?? "");
    syncUserMockWithApiUser(authenticatedUser);
  }, []);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const imageUrl = String(reader.result);
      setPhotoPreview(imageUrl);

      if (loggedUser) {
        try {
          const updatedUser = await updateUserPhoto(loggedUser.id, imageUrl);
          saveAuthenticatedUser(updatedUser);
          setLoggedUser(updatedUser);
          setSuccessMessage("Foto atualizada com sucesso.");
        } catch {
          setErrorMessage("Nao foi possivel atualizar a foto.");
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isEditing) {
      return;
    }

    if (!loggedUser) {
      setErrorMessage("Faca login novamente para editar o perfil.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedUser = await updateUser(loggedUser.id, {
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        cpf: form.cpf,
        userRole: form.userRole,
        active: form.active,
        passWord: form.passWord || undefined,
      });

      saveAuthenticatedUser(updatedUser);
      setLoggedUser(updatedUser);
      setForm((prev) => ({ ...prev, passWord: "" }));
      setIsEditing(false);
      setSuccessMessage("Perfil atualizado com sucesso.");
    } catch {
      setErrorMessage("Nao foi possivel salvar o perfil. Confira os dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const isEmployee = form.userRole === "EMPLOYEE";
  const roleLabel = form.userRole === "MANAGER" ? "Gestor" : "Colaborador";

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="w-full xl:w-72">
          <Card className="bg-primary-50 rounded-xl shadow-md p-6 flex flex-col items-center gap-4">
            {photoPreview ? (
              <img
                width={128}
                height={128}
                className="size-32 rounded-full border-4 border-primary object-cover"
                src={photoPreview}
                alt="Foto de perfil"
              />
            ) : (
              <div className="size-32 rounded-full border-4 border-primary bg-white flex items-center justify-center">
                <UserCircle2 className="size-20 text-primary-400" />
              </div>
            )}

            <div className="text-center">
              <span className="block text-primary-700 text-lg font-bold">
                {form.name} {form.lastName}
              </span>
              <span className="block text-neutral-600 text-sm">{roleLabel}</span>
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

        <form onSubmit={handleSubmit} className="flex-1">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <div className="bg-primary p-4">
              <span className="text-white font-semibold">Dados Pessoais</span>
            </div>

            <div className="bg-primary-50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">Nome</Label>
                  <Input
                    disabled={!isEditing}
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nome"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">Sobrenome</Label>
                  <Input
                    disabled={!isEditing}
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Sobrenome"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">
                    {isEmployee ? "E-mail (bloqueado para colaborador)" : "E-mail"}
                  </Label>
                  <Input
                    disabled={!isEditing || isEmployee}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder={isEmployee ? "E-mail nao pode ser alterado" : "E-mail"}
                    type="email"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">Telefone</Label>
                  <Input
                    disabled={!isEditing}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Telefone"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">CPF</Label>
                  <Input
                    disabled={!isEditing}
                    value={form.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="CPF"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">Tipo de usuario</Label>
                  <Input
                    disabled={!isEditing}
                    value={roleLabel}
                    placeholder="Tipo de usuario"
                    readOnly
                  />
                </div>

                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-primary-700 font-semibold text-sm">Nova senha</Label>
                  <Input
                    value={form.passWord}
                    onChange={(e) => handleChange("passWord", e.target.value)}
                    placeholder="Nova senha (opcional)"
                    type="password"
                  />
                  </div>
                )}
              </div>

              {errorMessage && (
                <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </p>
              )}

              <div className="mt-6 flex flex-col md:flex-row gap-3">
                {!isEditing ? (
                  <Button
                    type="button"
                    className="w-full bg-primary text-white"
                    onPress={() => {
                      setIsEditing(true);
                      setSuccessMessage("");
                      setErrorMessage("");
                    }}
                  >
                    Editar Dados
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      className="w-full bg-white text-primary border border-primary"
                      onPress={() => {
                        setIsEditing(false);
                        setErrorMessage("");
                      }}
                    >
                      Cancelar
                    </Button>

                    <Button
                      type="submit"
                      isDisabled={isSaving}
                      className="w-full bg-primary text-white"
                    >
                      {isSaving ? "Salvando..." : "Salvar Alteracoes"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};
