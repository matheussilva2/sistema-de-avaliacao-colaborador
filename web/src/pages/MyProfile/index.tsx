import { useState } from "react";
import { Button, Card, Input, Label, Checkbox } from "@heroui/react";

export const MyProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [permissions, setPermissions] = useState({
        viewTrainings: true,
        createTrainings: false,
        reportUsers: false,
        manageTrainings: false,
    });

    const handlePermissionChange = (key: keyof typeof permissions) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="p-8 bg-neutral-50 min-h-screen">
            {/* Profile Section */}
            <div className="flex gap-6 mb-8">
                {/* Left: Profile Card */}
                <div className="w-64 flex-shrink-0">
                    <Card className="bg-primary-50 rounded-xl shadow-md overflow-hidden">
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

                            <Button className="w-full bg-primary text-white font-semibold">
                                Editar
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right: Dados Pessoais */}
                <div className="flex-1">
                    <Card className="rounded-xl shadow-md overflow-hidden">
                        <div className="bg-primary p-4 border-b-4 border-primary">
                            <span className="text-white font-semibold text-base">Dados Pessoais</span>
                        </div>
                        <div className="bg-primary-50 p-6">
                            <form className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-primary-700 font-semibold text-sm">Nome</Label>
                                    <Input
                                        type="text"
                                        placeholder="Ana Maria"
                                        className="bg-white"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-primary-700 font-semibold text-sm">Sobrenome</Label>
                                    <Input
                                        type="text"
                                        placeholder="dos Santos"
                                        className="bg-white"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-primary-700 font-semibold text-sm">E-mail</Label>
                                    <Input
                                        type="email"
                                        placeholder="ana.santos@ufal.br"
                                        className="bg-white"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-primary-700 font-semibold text-sm">Telefone</Label>
                                    <Input
                                        type="tel"
                                        placeholder="(82) 9999-9999"
                                        className="bg-white"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-primary-700 font-semibold text-sm">E-mail Profissional</Label>
                                    <Input
                                        type="email"
                                        placeholder="anamaria@nees.ufal.br"
                                        className="bg-white"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-primary-700 font-semibold text-sm">Seguir a nova senha</Label>
                                    <Input
                                        type="text"
                                        placeholder="Nova senha"
                                        className="bg-white"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </form>

                            <Button className="w-full bg-primary text-white font-semibold mt-6">
                                Salvar Alterações
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Cargos e Permissões Section */}
            <Card className="rounded-xl shadow-md overflow-hidden">
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
                                disabled
                            />
                        </div>
                        <div />
                    </div>

                    <div className="mt-6">
                        <h3 className="text-primary-700 font-semibold text-sm mb-4">Permissões</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    isSelected={permissions.viewTrainings}
                                    onChange={() => handlePermissionChange('viewTrainings')}
                                    color="primary"
                                />
                                <span className="text-neutral-700">Ver Treinamentos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    isSelected={permissions.createTrainings}
                                    onChange={() => handlePermissionChange('createTrainings')}
                                    color="primary"
                                />
                                <span className="text-neutral-700">Criar Treinamentos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    isSelected={permissions.reportUsers}
                                    onChange={() => handlePermissionChange('reportUsers')}
                                    color="primary"
                                />
                                <span className="text-neutral-700">Denunciar Usuários</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    isSelected={permissions.manageTrainings}
                                    onChange={() => handlePermissionChange('manageTrainings')}
                                    color="primary"
                                />
                                <span className="text-neutral-700">Gerenciar Treinamentos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}