import { Avatar, AvatarImage, Button, Card, Input, Label } from "@heroui/react"

export const MyProfile = () => {
    return(
        <div className="flex gap-2.5 px-7 pt-3">
            <div className="w-fit">
                <Card className="w-64 bg-primary-50 rounded-md">
                    <Card.Content className="flex flex-col items-center gap-2 py-6.5">
                        <img
                            width={84}
                            className="rounded-full"
                            src="https://picsum.photos/seed/placeholder/500/500"
                        />

                        <input id="input-profile-picture" type="file" accept="image/png,image/jpg,image/jpeg" className="absolute -left-96" />

                        <label
                            htmlFor="input-profile-picture"
                            className="text-primary font-semibold px-4 py-1 border-2 rounded-full cursor-pointer border-primary">
                            Alterar Foto
                        </label>

                        <span className="text-primary-700 text-xl font-semibold">Ana Maria</span>

                        <span className="block bg-primary text-white rounded-full px-8">Ativo</span>
                    </Card.Content>
                </Card>
            </div>
            <div className="flex-1">
                <Card className="w-full bg-primary-200 p-0 rounded-md">
                    <Card.Header className="p-4">
                        <span className="text-primary-700 font-semibold text-lg">Dados Pessoais</span>
                    </Card.Header>
                    <Card.Content className="bg-primary-50 p-4">
                        <form className="grid grid-cols-2 gap-2.5">
                            <div className="flex flex-col w-full">
                                <Label htmlFor="input-name" className="text-primary">Nome</Label>
                                <Input type="text" name="name" id="input-name" value={'Ana Maria dos Santos'} disabled />
                            </div>
                            <div className="flex flex-col w-full">
                                <Label
                                    htmlFor="input-name"
                                    className="text-primary">
                                        E-mail
                                </Label>

                                <Input
                                    type="email"
                                    name="email"
                                    id="input-name"
                                    value={'anamaria@nees.ufal.br'}
                                    disabled
                                />
                            </div>

                            <div className="flex flex-col w-full">
                                <Label
                                    htmlFor="input-current-password"
                                    className="text-primary">
                                        Senha Atual
                                </Label>

                                <Input
                                    type="password"
                                    name="current_password"
                                    id="input-current-password"
                                    value={'anamaria@nees.ufal.br'}
                                    disabled
                                />
                            </div>

                            <div className="flex flex-col w-full">
                                <Label
                                    htmlFor="input-password"
                                    className="text-primary">
                                        Nova Senha
                                </Label>

                                <Input
                                    type="password"
                                    name="password"
                                    id="input-password"
                                    value={'anamaria@nees.ufal.br'}
                                    disabled
                                />
                            </div>

                            <div />
                            <Button className="w-full">Alterar Senha</Button>
                        </form>
                    </Card.Content>
                </Card>
            </div>
        </div>
    );
}