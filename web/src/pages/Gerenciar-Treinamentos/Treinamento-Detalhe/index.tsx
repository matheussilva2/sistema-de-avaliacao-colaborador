import { Card, Button } from "@heroui/react";
import { trainingsMock } from "../../../mock";
import { useNavigate, useParams } from "react-router-dom";
import AlunoCollapsible from "../AlunoCollapsible";

export default function TreinamentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  // mock simples (depois tu pega pelo ID via params)
  const training = trainingsMock.find((t) => t.id === Number(id));

  if (!training) return <div>Nenhum treinamento com esse id</div>;

  const alunosMock = [
    {
      nome: "João Silva",
      status: "concluido",
      progress: 96,
      notaMedia: "9.4",
      ultimaAtividade: "Quiz Final",
      tarefasConcluidas: 12,
      totalTarefas: 12,
      comentarios: "Excelente desempenho nas últimas avaliações.",
    },
    {
      nome: "Maria Souza",
      status: "em_andamento",
      progress: 72,
      notaMedia: "8.2",
      ultimaAtividade: "Estudo de caso",
      tarefasConcluidas: 8,
      totalTarefas: 11,
      comentarios: "Bom ritmo, faltam apenas duas atividades.",
    },
    {
      nome: "Carlos Lima",
      status: "nao_iniciado",
      progress: 10,
      notaMedia: "6.0",
      ultimaAtividade: "Introdução ao curso",
      tarefasConcluidas: 1,
      totalTarefas: 10,
      comentarios: "Ainda não avançou muito no conteúdo.",
    },
    {
      nome: "Ana Costa",
      status: "incompleto",
      progress: 43,
      notaMedia: "7.1",
      ultimaAtividade: "Aula 4",
      tarefasConcluidas: 5,
      totalTarefas: 12,
      comentarios: "Precisa revisar alguns módulos para completar o curso.",
    },
    {
      nome: "Lucas Alves",
      status: "em_andamento",
      progress: 58,
      notaMedia: "7.8",
      ultimaAtividade: "Prática final",
      tarefasConcluidas: 7,
      totalTarefas: 12,
      comentarios: "Avançando bem, mas com margem para melhorar.",
    },
  ];

  const avaliacoesMock = [
    {
      titulo: "Pré-Test",
      tipo: "Múltipla escolha",
      acertos: "0/10",
      data: "10/05",
    },
    {
      titulo: "Quiz Final",
      tipo: "Múltipla escolha",
      acertos: "0/10",
      data: "30/06",
    },
  ];

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      {/* HEADER */}
      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-4">
          {training.title}
        </h1>

        {/* INFO BOXES */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-primary-50 p-4 rounded-md">
            <span className="text-sm text-neutral-600">Carga Horária</span>
            <p className="font-bold text-lg">{training.hours}h</p>
          </div>

          <div className="bg-primary-50 p-4 rounded-md">
            <span className="text-sm text-neutral-600">Início</span>
            <p className="font-bold text-lg">{training.startDate}</p>
          </div>

          <div className="bg-primary-50 p-4 rounded-md">
            <span className="text-sm text-neutral-600">Término</span>
            <p className="font-bold text-lg">{training.endDate}</p>
          </div>
        </div>

        {/* DESCRIÇÃO */}
        <p className="text-neutral-700">
          Este treinamento tem como objetivo capacitar os colaboradores nos
          principais conceitos e práticas relacionados ao tema, garantindo
          melhor desempenho e alinhamento com os processos da organização.
        </p>
      </Card>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-2 gap-6">
        {/* ALUNOS (SPAN 2) */}
        <Card className="p-6 col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">
              Alunos Inscritos
            </h2>
            <span className="text-sm text-neutral-600">
              {alunosMock.length} pessoas
            </span>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              className="bg-primary text-white"
              onPress={() => navigate(`/painel/gerenciar-treinamentos/${training.id}/adicionar-alunos`)}
            >
              Adicionar Alunos +
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {alunosMock.map((aluno) => (
              <AlunoCollapsible key={aluno.nome} aluno={aluno} />
            ))}
          </div>
        </Card>

        {/* AVALIAÇÕES */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Avaliações
          </h2>

          <div className="flex flex-col gap-3">
            {avaliacoesMock.map((av, index) => (
              <div key={index} className="bg-neutral-50 p-4 rounded-md">
                <p className="font-semibold text-neutral-900">{av.titulo}</p>

                <p className="text-sm text-neutral-600">Tipo: {av.tipo}</p>

                <p className="text-sm text-neutral-600">
                  Acertos necessários: {av.acertos}
                </p>

                <p className="text-sm text-neutral-600">Data: {av.data}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* (espaço futuro pra outra sessão se quiser) */}
        <div />
      </div>
    </div>
  );
}
