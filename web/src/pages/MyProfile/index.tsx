import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Label } from "@heroui/react";
import { UserCircle2 } from "lucide-react";
import {
  ApiRequestError,
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
    confirmPassword: "",
    hireDate: "",
    registrationDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      cpf: formatCpf(authenticatedUser.cpf),
      userRole: authenticatedUser.userRole,
      active: authenticatedUser.active,
      passWord: "",
      confirmPassword: "",
      hireDate: authenticatedUser.hireDate ?? getTodayDate(),
      registrationDate: authenticatedUser.registrationDate ?? getTodayDate(),
    });

    setPhotoPreview(authenticatedUser.profilePhoto ?? "");
    syncUserMockWithApiUser(authenticatedUser);
  }, []);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    const nextValue = field === "cpf" && typeof value === "string" ? formatCpf(value) : value;

    setForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
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
    const validationErrors = validateProfileForm(form, isEmployee);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("Corrija os campos destacados antes de salvar.");
      setIsSaving(false);
      return;
    }

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
        hireDate: form.hireDate,
        registrationDate: form.registrationDate,
      });

      saveAuthenticatedUser(updatedUser);
      setLoggedUser(updatedUser);
      setForm((prev) => ({
        ...prev,
        cpf: formatCpf(updatedUser.cpf),
        passWord: "",
        confirmPassword: "",
        hireDate: updatedUser.hireDate ?? prev.hireDate,
        registrationDate: updatedUser.registrationDate ?? prev.registrationDate,
      }));
      setIsEditing(false);
      setSuccessMessage("Perfil atualizado com sucesso.");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409) {
        const conflict = getProfileConflictMessage(error.message);
        setErrorMessage(conflict.global);
        setFieldErrors((prev) => ({
          ...prev,
          [conflict.field]: conflict.fieldMessage,
        }));
      } else {
        setErrorMessage("Nao foi possivel salvar o perfil. Confira os dados.");
      }
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
                  <FieldError message={fieldErrors.email} />
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
                  <FieldError message={fieldErrors.cpf} />
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
                  {form.passWord && <PasswordRequirements password={form.passWord} />}
                  <FieldError message={fieldErrors.passWord} />
                  </div>
                )}

                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-primary-700 font-semibold text-sm">
                      Confirmar nova senha
                    </Label>
                    <Input
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      placeholder="Repita apenas se alterar a senha"
                      type="password"
                    />
                    <FieldError message={fieldErrors.confirmPassword} />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">
                    Data de contratação
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={form.hireDate}
                    onChange={(e) => handleChange("hireDate", e.target.value)}
                    type="date"
                    required
                  />
                  <FieldError message={fieldErrors.hireDate} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-primary-700 font-semibold text-sm">
                    Data de registro
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={form.registrationDate}
                    onChange={(e) => handleChange("registrationDate", e.target.value)}
                    type="date"
                    required
                  />
                  <FieldError message={fieldErrors.registrationDate} />
                </div>
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
                        setFieldErrors({});
                        setForm((prev) => ({
                          ...prev,
                          passWord: "",
                          confirmPassword: "",
                        }));
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

                    {errorMessage && (
                      <p className="text-sm font-semibold text-red-600 md:self-center">
                        {errorMessage}
                      </p>
                    )}
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

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-semibold text-red-600">{message}</p>;
}

function PasswordRequirements({ password }: { password: string }) {
  const requirements = getPasswordRequirements(password);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs">
      <p className="mb-2 font-semibold text-neutral-700">Requisitos da senha</p>
      <div className="grid gap-1">
        {requirements.map((requirement) => (
          <span
            key={requirement.label}
            className={requirement.valid ? "text-green-700" : "text-red-600"}
          >
            {requirement.valid ? "✓" : "x"} {requirement.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function validateProfileForm(
  form: {
    email: string;
    cpf: string;
    passWord: string;
    confirmPassword: string;
    hireDate: string;
    registrationDate: string;
  },
  isEmployee: boolean,
) {
  const errors: Record<string, string> = {};

  if (!isEmployee && !isValidEmail(form.email)) {
    errors.email = "Informe um e-mail valido.";
  }

  if (!isValidCpf(form.cpf)) {
    errors.cpf = "Informe um CPF valido.";
  }

  if (!form.registrationDate) {
    errors.registrationDate = "Informe a data de registro.";
  }

  if (!form.hireDate) {
    errors.hireDate = "Informe a data de contratacao.";
  } else {
    const hireDateError = validateHireDate(form.hireDate, form.registrationDate);

    if (hireDateError) {
      errors.hireDate = hireDateError;
    }
  }

  if (form.passWord || form.confirmPassword) {
    if (!isValidPassword(form.passWord)) {
      errors.passWord = "A senha nao atende aos requisitos minimos.";
    }

    if (form.passWord !== form.confirmPassword) {
      errors.confirmPassword = "As senhas nao conferem.";
    }
  }

  return errors;
}

function getPasswordRequirements(password: string) {
  return [
    { label: "Minimo de 8 caracteres", valid: password.length >= 8 },
    { label: "Uma letra maiuscula", valid: /[A-Z]/.test(password) },
    { label: "Uma letra minuscula", valid: /[a-z]/.test(password) },
    { label: "Um numero", valid: /\d/.test(password) },
  ];
}

function isValidPassword(password: string) {
  return getPasswordRequirements(password).every((requirement) => requirement.valid);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateHireDate(hireDateValue: string, registrationDateValue: string) {
  const hireDate = parseDate(hireDateValue);
  const registrationDate = parseDate(registrationDateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyYearsAgo = new Date(today);
  thirtyYearsAgo.setFullYear(today.getFullYear() - 30);

  if (!hireDate) {
    return "Informe uma data de contratacao valida.";
  }

  if (registrationDate && hireDate < registrationDate) {
    return "A data de contratacao nao pode ser anterior a data de registro.";
  }

  if (hireDate < thirtyYearsAgo) {
    return "A data de contratacao nao pode ser inferior a 30 anos.";
  }

  if (hireDate > today) {
    return "A data de contratacao nao pode ser superior ao dia de hoje.";
  }

  return "";
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isValidCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const calculateDigit = (base: string, weight: number) => {
    const sum = base
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(digits.slice(0, 9), 10);
  const secondDigit = calculateDigit(`${digits.slice(0, 9)}${firstDigit}`, 11);

  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10]);
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function getProfileConflictMessage(message: string) {
  if (message.includes("Email already registered")) {
    return {
      field: "email",
      fieldMessage: "Ja existe uma conta cadastrada com esse e-mail.",
      global: "Ja existe uma conta cadastrada com esse e-mail.",
    };
  }

  if (message.includes("Invalid CPF")) {
    return {
      field: "cpf",
      fieldMessage: "Informe um CPF valido.",
      global: "Corrija os campos destacados antes de salvar.",
    };
  }

  return {
    field: "email",
    fieldMessage: "Nao foi possivel salvar esse campo.",
    global: "Nao foi possivel salvar o perfil. Confira os dados.",
  };
}
