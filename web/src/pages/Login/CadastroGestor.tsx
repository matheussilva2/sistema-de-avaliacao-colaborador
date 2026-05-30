import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Label, Button } from "@heroui/react";
import { ApiRequestError, createUser } from "../../services/authService";

export default function CadastroGestor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    cpf: "",
    empresa: "",
    senha: "",
    confirmarSenha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    const nextValue = field === "cpf" ? formatCpf(value) : value;

    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    const validationErrors = validateManagerForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("Corrija os campos destacados antes de criar a conta.");
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      await createUser({
        name: form.nome,
        lastName: form.sobrenome,
        email: form.email,
        phone: form.telefone,
        cpf: form.cpf,
        passWord: form.senha,
        hireDate: getTodayDate(),
        registrationDate: getTodayDate(),
        userRole: "MANAGER",
        active: true,
      });

      navigate("/");
    } catch (error) {
      if (error instanceof ApiRequestError && (error.status === 400 || error.status === 409)) {
        const message = getCreateUserErrorMessage(error.message);
        setErrorMessage(message.global);

        if (message.field) {
          setFieldErrors((prev) => ({ ...prev, [message.field]: message.fieldMessage }));
        }
      } else {
        setErrorMessage("Nao foi possivel criar a conta. Confira os dados.");
      }
    } finally {
      setIsLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="p-8 bg-white">
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
                required
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
                required
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
                required
              />
              <FieldError message={fieldErrors.email} />
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
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cpf" className="text-gray-700 font-semibold text-sm">
                CPF
              </Label>
              <Input
                id="cpf"
                type="text"
                value={form.cpf}
                onChange={(e) => handleFieldChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                className="bg-white"
                required
              />
              <FieldError message={fieldErrors.cpf} />
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
                placeholder="Senha para primeiro acesso"
                className="bg-white"
                required
              />
              <PasswordRequirements password={form.senha} />
              <FieldError message={fieldErrors.senha} />
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
                placeholder="Digite a senha novamente"
                className="bg-white"
                required
              />
              <FieldError message={fieldErrors.confirmarSenha} />
            </div>
          </div>

          {errorMessage && (
            <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-between items-center gap-4 flex-col sm:flex-row">
            <Button
              type="submit"
              className="bg-primary text-white px-8"
              isDisabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar conta"}
            </Button>
            <Button className="bg-white text-primary border border-primary px-8" onPress={() => navigate("/")}>
              Voltar ao login
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}

function getTodayDate() {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);

  return localToday.toISOString().slice(0, 10);
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
            {requirement.valid ? "OK" : "x"} {requirement.label}
          </span>
        ))}
      </div>
    </div>
  );
}

type ManagerForm = {
  email: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
};

function validateManagerForm(form: ManagerForm) {
  const errors: Record<string, string> = {};

  if (!isValidEmail(form.email)) {
    errors.email = "Informe um e-mail valido.";
  }

  if (!isValidCpf(form.cpf)) {
    errors.cpf = "Informe um CPF valido.";
  }

  if (!isValidPassword(form.senha)) {
    errors.senha = "A senha nao atende aos requisitos minimos.";
  }

  if (form.senha !== form.confirmarSenha) {
    errors.confirmarSenha = "As senhas nao conferem.";
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

function getCreateUserErrorMessage(message: string) {
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
      global: "Corrija os campos destacados antes de criar a conta.",
    };
  }

  if (message.includes("Password does not meet requirements")) {
    return {
      field: "senha",
      fieldMessage: "A senha nao atende aos requisitos minimos.",
      global: "Corrija os campos destacados antes de criar a conta.",
    };
  }

  return {
    field: "",
    fieldMessage: "",
    global: "Nao foi possivel criar a conta. Confira os dados.",
  };
}
