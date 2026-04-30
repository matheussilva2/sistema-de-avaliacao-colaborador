import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/react";
import { colaboradores as colaboradoresMock, trainingsMock } from "../../mock";

export default function AdicionarAluno() {
  const navigate = useNavigate();
  const { id } = useParams();
  const training = trainingsMock.find((t) => t.id === Number(id));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  if (!training) {
    return <div className="p-8">Treinamento não encontrado.</div>;
  }

  const toggleSelect = (colaboradorId: number) => {
    setSelectedIds((current) =>
      current.includes(colaboradorId)
        ? current.filter((item) => item !== colaboradorId)
        : [...current, colaboradorId],
    );
  };

  const handleRemove = (colaboradorId: number) => {
    setSelectedIds((current) => current.filter((item) => item !== colaboradorId));
  };

  const handleSave = () => {
    const selectedStudents = colaboradoresMock.filter((colaborador) =>
      selectedIds.includes(colaborador.id),
    );

    console.log("Alunos selecionados para", training.title, selectedStudents);
    navigate(`/painel/gerenciar-treinamentos/${training.id}`);
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Adicionar Alunos</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Selecione colaboradores para incluir neste treinamento.
          </p>
        </div>
        <Button
          className="bg-white text-primary border border-primary font-semibold px-6"
          onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.id}`)}
        >
          Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-3xl bg-white shadow-sm border-4 border-gray-200 p-6">
          <div className="flex flex-col gap-4">
            {colaboradoresMock.map((colaborador) => {
              const isSelected = selectedIds.includes(colaborador.id);
              return (
                <div
                  key={colaborador.id}
                  className={`rounded-2xl border-4 p-4 transition-colors ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSelect(colaborador.id)}
                      className="flex items-center gap-4 text-left w-full cursor-pointer"
                    >
                      <img
                        src={`https://picsum.photos/seed/colaborador${colaborador.id}/64/64`}
                        alt={colaborador.nome}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{colaborador.nome}</p>
                        <p className="text-sm text-neutral-500">{colaborador.email}</p>
                      </div>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          isSelected
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {isSelected ? "Selecionado" : "Selecionar"}
                      </span>
                    </button>

                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => handleRemove(colaborador.id)}
                        className="text-red-600 font-semibold px-2 py-1 rounded-full hover:bg-red-50"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary">Alunos selecionados</h2>
                <p className="text-sm text-neutral-600">{selectedIds.length} aluno(s) escolhido(s)</p>
              </div>
              <Button
                className="bg-primary text-white"
                onPress={handleSave}
                isDisabled={selectedIds.length === 0}
              >
                Salvar
              </Button>
            </div>

            {selectedIds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-neutral-500">
                Nenhum aluno selecionado.
              </div>
            ) : (
              <div className="grid gap-3">
                {colaboradoresMock
                  .filter((colaborador) => selectedIds.includes(colaborador.id))
                  .map((colaborador) => (
                    <div
                      key={colaborador.id}
                      className="flex items-center justify-between rounded-2xl border border-green-300 bg-green-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://picsum.photos/seed/colaborador${colaborador.id}/48/48`}
                          alt={colaborador.nome}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">{colaborador.nome}</p>
                          <p className="text-sm text-neutral-600">{colaborador.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(colaborador.id)}
                        className="text-red-600 font-semibold px-2 py-1 rounded-full hover:bg-red-100 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
