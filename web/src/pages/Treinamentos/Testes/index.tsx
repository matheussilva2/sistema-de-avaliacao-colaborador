import { PosTeste } from "./PosTeste";
import { PreTeste } from "./PreTeste";

type AbaTreinamento = "pre-teste" | "satisfacao" | "pos-teste";

type Props = {
  abaAtiva: AbaTreinamento;
};

export const ConteudoTeste = ({ abaAtiva }: Props) => {
  if (abaAtiva === "pre-teste") {
    return <PreTeste />;
  }

  if (abaAtiva === "satisfacao") {
    return (
      <div className="p-8 bg-white rounded-lg text-center">
        <p>Página de Satisfação - Em desenvolvimento</p>
      </div>
    );
  }

  return <PosTeste />;
};

export type { AbaTreinamento };
