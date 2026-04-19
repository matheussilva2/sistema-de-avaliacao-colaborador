import { Button, Input, Table } from "@heroui/react";
import { Link } from "react-router-dom";

export const ManageUsers = () => {
    return (
        <div className="py-10 px-4">
            <div className="flex justify-between mb-8">
                <Input type="text" placeholder="Procurar por nome..." className="w-87" />
                <Link
                    to="/painel/colaboradores/criar"
                    className="bg-primary text-white px-4 py-2.5 rounded-lg"
                >Adicionar Usuário</Link>
            </div>

            <Table>
                <Table.Content>
                    <Table.Header>
                        <Table.Column>CPF</Table.Column>
                        <Table.Column>NOME</Table.Column>
                        <Table.Column>E-MAIL</Table.Column>
                        <Table.Column>CARGO</Table.Column>
                        <Table.Column>SITUAÇÃO</Table.Column>
                        <Table.Column>OPÇÕES</Table.Column>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>123.456.789-10</Table.Cell>
                            <Table.Cell>Ana Maria dos Santos</Table.Cell>
                            <Table.Cell>anamaria@nees.ufal.br</Table.Cell>
                            <Table.Cell>Analista de Dados</Table.Cell>
                            <Table.Cell>EMPREGADO</Table.Cell>
                            <Table.Cell>
                                <Link to="/painel/colaboradores/id" className="text-primary">Ver dados</Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>123.456.789-10</Table.Cell>
                            <Table.Cell>Ana Maria dos Santos</Table.Cell>
                            <Table.Cell>anamaria@nees.ufal.br</Table.Cell>
                            <Table.Cell>Analista de Dados</Table.Cell>
                            <Table.Cell>EMPREGADO</Table.Cell>
                            <Table.Cell>
                                <Link to="/painel/colaboradores/id" className="text-primary">Ver dados</Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>123.456.789-10</Table.Cell>
                            <Table.Cell>Ana Maria dos Santos</Table.Cell>
                            <Table.Cell>anamaria@nees.ufal.br</Table.Cell>
                            <Table.Cell>Analista de Dados</Table.Cell>
                            <Table.Cell>EMPREGADO</Table.Cell>
                            <Table.Cell>
                                <Link to="/painel/colaboradores/id" className="text-primary">Ver dados</Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>123.456.789-10</Table.Cell>
                            <Table.Cell>Ana Maria dos Santos</Table.Cell>
                            <Table.Cell>anamaria@nees.ufal.br</Table.Cell>
                            <Table.Cell>Analista de Dados</Table.Cell>
                            <Table.Cell>EMPREGADO</Table.Cell>
                            <Table.Cell>
                                <Link to="/painel/colaboradores/id" className="text-primary">Ver dados</Link>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Content>
            </Table>
        </div>
    );
}