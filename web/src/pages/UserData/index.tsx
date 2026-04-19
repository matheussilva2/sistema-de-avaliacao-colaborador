import { useState } from "react";
import { Button, Card, Input, Label, Checkbox } from "@heroui/react";
import type { Permission } from "../../types/Permission";

const permissionsMock: Permission[] = [
    {
        name: "manage_trainings",
        label: "Gerenciar Treinamentos",
        isEnabled: true
    },
    {
        name: "manage_users",
        label: "Gerenciar usuários",
        isEnabled: false
    }
];

export const UserData = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>(permissionsMock);

    const handlePermissionChange = (permissionName: string) => {
        const updatedPermissions = permissions.map(permission => {
            if(permission.name === permissionName) {
                return { ...permission, isEnabled: !permission.isEnabled }
            }
            return permission;
        });
        
        setPermissions(updatedPermissions);
    };

    return (
        <div className="p-8 bg-neutral-50 min-h-screen">
            <div className="flex gap-6 mb-8">
                <div className="w-64">
                    <Card className="bg-primary-50 rounded-xl shadow-md overflow-hidden p-0">
                        <div className="p-6 flex flex-col items-center gap-4">
                            <img
                                width={80}
                                height={80}
                                className="rounded-full border-4 border-primary object-cover"
                                src="https://picsum.photos/seed/placeholder/500/500"
                                alt="Profile"
                            />

                            <input
                                id="input-profile-picture"
                                type="file"
                                accept="image/png,image/jpg,image/jpeg"
                                className="absolute -left-96"
                            />

                            <label
                                htmlFor="input-profile-picture"
                                className="text-primary font-semibold text-sm px-4 py-2 border-2 rounded-full cursor-pointer border-primary hover:bg-primary-100 transition-colors"
                            >
                                Alterar Foto
                            </label>

                            <div className="text-center">
                                <span className="block text-primary-700 text-lg font-bold">Ana Maria</span>
                                <span className="block text-neutral-600 text-sm">Analista de Dados</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="flex-1">
                    <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
                        <div className="bg-primary p-4 border-b-4 border-primary">
                            <span className="text-white font-semibold text-base">Dados Pessoais</span>
                        </div>
                        <div className="bg-primary-50 p-6">
                            <form className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="profile_nome_input"
                                        className="text-primary-700 font-semibold text-sm">
                                            Nome
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Digite seu nome"
                                        className="bg-white"
                                        disabled={!isEditing}
                                        value="Ana Maria"
                                        name="nome"
                                        id="profile_nome_input"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="profile_sobrenome_input"
                                        className="text-primary-700 font-semibold text-sm">
                                            Sobrenome
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Digite seu sobrenome"
                                        className="bg-white"
                                        disabled={!isEditing}
                                        value="dos Santos"
                                        name="sobrenome"
                                        id="profile_sobrenome_input"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="profile_email_input"
                                        className="text-primary-700 font-semibold text-sm">
                                            E-mail
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="Digite seu e-mail"
                                        className="bg-white"
                                        disabled={!isEditing}
                                        value="ana.santos@ufal.br"
                                        name="email"
                                        id="profile_email_input"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="profile_telefone_input"
                                        className="text-primary-700 font-semibold text-sm">
                                            Telefone
                                    </Label>
                                    <Input
                                        type="tel"
                                        placeholder="(XX) XXXXX-XXXX"
                                        className="bg-white"
                                        disabled={!isEditing}
                                        value="(82) 99999-9999"
                                        name="telefone"
                                        id="profile_telefone_input"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="profile_password_input"
                                        className="text-primary-700 font-semibold text-sm">
                                            Alterar Senha
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Nova senha"
                                        className="bg-white"
                                        disabled={!isEditing}
                                        name="password"
                                        id="profile_password_input"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="profile_repassword_input"
                                        className="text-primary-700 font-semibold text-sm">
                                            Confirmar Senha
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Confirme a senha"
                                        className="bg-white"
                                        disabled={!isEditing}
                                        name="password_confirmation"
                                        id="profile_repassword_input"
                                    />
                                </div>
                            </form>

                            {
                                isEditing ? (
                                    <Button
                                        onPress={() => setIsEditing(false)}
                                        className="w-full bg-primary text-white font-semibold mt-6">
                                        Salvar Alterações
                                    </Button>
                                ) : (
                                    <Button
                                        onPress={() => setIsEditing(true)}
                                        className="w-full bg-primary text-white font-semibold mt-6">
                                        Editar Dados
                                    </Button>
                                )
                            }
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
                <div className="bg-primary p-4">
                    <span className="text-white font-semibold text-base">Cargos e Permissões</span>
                </div>
                <div className="bg-primary-50 p-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-3">
                            <Label className="text-primary-700 font-semibold text-sm">Cargo</Label>
                            <Input
                                type="text"
                                placeholder="Analista de Dados"
                                className="bg-white"
                                value={"Analista de Dados"}
                            />
                        </div>
                        <div />
                    </div>

                    <div className="mt-6">
                        <h3 className="text-primary-700 font-semibold text-sm mb-4">Permissões</h3>
                        <div className="flex flex-col gap-3">
                            {
                                permissions.map((permission) => (
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`permissions_${permission.name}`}
                                            isSelected={permission.isEnabled}
                                            onChange={() => handlePermissionChange(permission.name)}
                                        >
                                            <Checkbox.Control
                                            >
                                                <Checkbox.Indicator />
                                            </Checkbox.Control>
                                        </Checkbox>
                                        <label
                                            htmlFor={`permissions_${permission.name}`}
                                            className="text-gray-700 cursor-pointer"
                                        >
                                            {permission.label}
                                        </label>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}