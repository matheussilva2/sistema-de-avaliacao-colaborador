import { Button } from "@heroui/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colaboradores as colaboradoresMock } from "../../mock";

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState(colaboradoresMock);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filtrados = colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRowClick = (id: number) => {
    navigate(`/painel/colaboradores/${id}`);
  };

  const handleDelete = (id: number) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
  };
  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex w-full max-w-xl bg-white pl-4 pr-3 rounded-full items-center gap-2 border border-gray-200 focus-within:border-gray-400 transition">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full py-2 outline-none text-sm placeholder:text-gray-400"
          />
        </div>

        <Button
          className="bg-primary text-white font-semibold px-6"
          onPress={() => navigate("/painel/colaboradores/adicionar")}
        >
          + Adicionar Colaborador
        </Button>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 ">
            <tr className="text-gray-500 uppercase text-sm">
              <th className="p-4">ID</th>
              <th className="p-4">CPF</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Email</th>
              <th className="p-4">Cargo</th>
              <th className="p-4">Situação</th>
              <th className="p-4">Opções</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-neutral-50 cursor-pointer"
                onClick={() => handleRowClick(c.id)}
              >
                <td className="p-4">{c.id}</td>
                <td className="p-4">{c.cpf}</td>
                <td className="p-4">{c.nome}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.cargo}</td>
                <td className="p-4">
                  {/* <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      c.situacao === "Ativo"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  > */}
                  {c.situacao}
                  {/* </span> */}
                </td>
                <td
                  className="p-4"
                  onClick={(e) => e.stopPropagation()} // evita disparar o clique da linha
                >
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-700 text-sm rounded-md"
                    onClick={() => {
                      handleDelete(c.id);
                    }}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <div className="p-6 text-center text-neutral-500">
            Nenhum colaborador encontrado
          </div>
        )}
      </div>
    </div>
  );
}
