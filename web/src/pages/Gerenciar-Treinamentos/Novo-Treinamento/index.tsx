import { useState } from "react";
import { Card, Input, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

// Tipagens para o formulário de perguntas
type Option = { id: string; text: string };
type Question = { id: string; title: string; options: Option[] };

export default function CriarTreinamento() {
  const navigate = useNavigate();

  // Estado das informações básicas
  const [form, setForm] = useState({
    title: "",
    hours: "",
    startDate: "",
    endDate: "",
    testType: "pre-teste",
    description: "",
  });

  // Estado das perguntas de múltipla escolha
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --- FUNÇÕES DO FORMULÁRIO DE PERGUNTAS ---

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: "",
      options: [{ id: Date.now().toString() + "-opt", text: "" }],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionTitleChange = (qId: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === qId ? { ...q, title: value } : q))
    );
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const handleAddOption = (qId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: [...q.options, { id: Date.now().toString(), text: "" }],
          };
        }
        return q;
      })
    );
  };

  const handleOptionChange = (qId: string, optId: string, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optId ? { ...o, text: value } : o
            ),
          };
        }
        return q;
      })
    );
  };

  const handleRemoveOption = (qId: string, optId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.filter((o) => o.id !== optId),
          };
        }
        return q;
      })
    );
  };

  // --- SUBMIT ---

  const handleSubmit = () => {
    // mock de criação
    const newTraining = {
      id: Date.now(),
      title: form.title,
      hours: Number(form.hours),
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      progress: 0,
      daysLeft: 0,
      status: "em_andamento",
      questions: questions, // Perguntas incluídas no payload
    };

    console.log("NOVO TREINAMENTO:", newTraining);

    // depois tu salva num estado global ou API
    navigate("/painel/gerenciar-treinamentos");
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* CARD DE INFORMAÇÕES BÁSICAS - COM A BORDA AZUL SALTANDO */}
        <Card className="p-6 border-t-4 border-l-4 border-primary shadow-lg">
          <h1 className="text-2xl font-bold text-primary mb-6">
            Criar Novo Treinamento
          </h1>

          <div className="flex flex-col gap-4">
            {/* TÍTULO */}
            <Input
              placeholder="Título do treinamento"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            {/* GRID INFO */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                placeholder="Carga horária (h)"
                value={form.hours}
                onChange={(e) => handleChange("hours", e.target.value)}
                className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <Input
                type="text"
                placeholder="Data de início (ex: 20/05)"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <Input
                type="text"
                placeholder="Data de término (ex: 30/06)"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="bg-white border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* TIPO DE AVALIAÇÃO */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-neutral-700">
                Tipo de avaliação
              </span>
              <div className="flex items-center gap-4">
                {[
                  { value: "pre-teste", label: "Pré-teste" },
                  { value: "pos-teste", label: "Pós-teste" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="testType"
                      value={option.value}
                      checked={form.testType === option.value}
                      onChange={(e) => handleChange("testType", e.target.value)}
                      className="form-radio h-4 w-4 text-primary accent-primary"
                    />
                    <span className="text-sm text-neutral-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <textarea
              placeholder="Descrição do treinamento..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="bg-white border-2 border-neutral-300 rounded-md p-3 text-sm outline-none resize-none min-h-[120px] focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </Card>

        {/* SEÇÃO DE PERGUNTAS (ESTILO GOOGLE FORMS) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-primary px-2">
            Avaliação do Treinamento
          </h2>

          {questions.map((q, qIndex) => (
            <Card key={q.id} className="p-6 border-l-4 border-l-primary shadow-sm">
              <div className="flex flex-col gap-4">
                
                {/* Título da Pergunta */}
                <div className="flex justify-between items-start gap-4">
                  <Input
                    placeholder={`Pergunta ${qIndex + 1}`}
                    value={q.title}
                    onChange={(e) => handleQuestionTitleChange(q.id, e.target.value)}
                    className="bg-neutral-50 flex-1 font-medium border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    isIconOnly
                    onPress={() => handleRemoveQuestion(q.id)}
                    aria-label="Remover pergunta"
                    className="!bg-transparent hover:!bg-danger/10 text-danger"
                  >
                    ✕
                  </Button>
                </div>

                {/* Opções da Pergunta */}
                <div className="flex flex-col gap-2 mt-2">
                  {q.options.map((opt, optIndex) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      {/* Círculo simulando radio button */}
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                      
                      <Input
                        placeholder={`Opção ${optIndex + 1}`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)}
                        className="bg-white flex-1 border-2 border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      
                      {/* Botão de remover opção (só aparece se houver mais de 1 opção) */}
                      {q.options.length > 1 && (
                        <button
                          onClick={() => handleRemoveOption(q.id, opt.id)}
                          className="text-neutral-400 hover:text-danger p-2 transition-colors text-xl font-light"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Adicionar nova opção */}
                <div className="flex items-center gap-3 mt-1 ml-1">
                   <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0 opacity-50" />
                   <button 
                     onClick={() => handleAddOption(q.id)}
                     className="text-sm text-neutral-500 hover:text-primary hover:underline"
                   >
                     Adicionar opção
                   </button>
                </div>

              </div>
            </Card>
          ))}

          {/* Botão para adicionar nova pergunta */}
          <Button
            className="bg-primary/10 text-primary font-medium w-full py-6 mt-2 border border-primary/20 border-dashed"
            onPress={handleAddQuestion}
          >
            + Adicionar Pergunta
          </Button>
        </div>

        {/* BOTÕES DE AÇÃO GERAIS */}
        <div className="flex gap-3 mt-4 justify-end">
          <Button
            className="bg-neutral-300 text-neutral-800 w-32"
            onPress={() => navigate(-1)}
          >
            Cancelar
          </Button>

          <Button
            className="bg-primary text-white w-48"
            onPress={handleSubmit}
          >
            Salvar Treinamento
          </Button>
        </div>

      </div>
    </div>
  );
}