type Props = {
  titulo?: string;
};

export const FormularioTeste = ({ titulo = "Formulário de Teste" }: Props) => {
  return (
    <div className="p-8 bg-white rounded-lg text-center">
      <h3 className="font-semibold text-neutral-800">{titulo}</h3>
      <p className="text-neutral-600 mt-2">Formulário em desenvolvimento</p>
    </div>
  );
};
