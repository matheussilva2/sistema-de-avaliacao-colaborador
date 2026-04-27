export const PosTeste = () => {
  return (
    <div className="w-full flex flex-col font-sans">
      <div className="bg-[#8ab4f8] text-[#1e3a8a] font-bold px-6 py-3 rounded-t-lg">
        Pós-teste - Resultado
      </div>

      <div className="bg-[#eef4fe] p-6 rounded-b-lg flex flex-col gap-6">
        <div className="flex gap-4 mb-2">
          <div className="bg-[#7aa7f7] text-[#0f276b] px-4 py-3 rounded-md flex-1">
            <p className="text-sm">Acertos</p>
            <p className="font-bold text-lg">4 de 5</p>
          </div>
          <div className="bg-[#7aa7f7] text-[#0f276b] px-4 py-3 rounded-md flex-1">
            <p className="text-sm">Mínimo Exigido</p>
            <p className="font-bold text-lg">3 de 5</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-[#1e3a8a]">
          <h3 className="font-bold text-base mb-1">
            1) Qual a principal diferença entre o pré e o pós-teste?
          </h3>

          <div className="flex items-start gap-3 bg-[#d2e3fc] border border-[#a1c2fa] p-3 rounded-md">
            <div className="min-w-[24px] flex justify-center mt-0.5">
              <svg
                className="w-5 h-5 text-[#4285f4]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
            </div>
            <p className="text-sm font-medium">
              O pré-teste é focado em avaliar o instrutor, enquanto o pós-teste
              avalia a plataforma.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-[#ceead6] border border-[#81c995] p-3 rounded-md text-[#0d652d]">
            <div className="min-w-[24px] flex justify-center mt-0.5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" fill="#34a853" stroke="none"></circle>
                <path
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12.5l3 3 6-6"
                ></path>
              </svg>
            </div>
            <p className="text-sm font-medium">
              O pós-teste mede a retenção do conhecimento adquirido após a
              conclusão do material.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-[#f8d7da] border border-[#f5c2c7] p-3 rounded-md text-[#842029]">
            <div className="min-w-[24px] flex justify-center mt-0.5">
              <svg
                className="w-5 h-5 text-[#dc3545]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9l6 6m0-6l-6 6"
                ></path>
              </svg>
            </div>
            <p className="text-sm font-medium text-[#b02a37]">
              Não existe diferença, ambos são aplicados no mesmo momento. (Sua
              resposta)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 text-[#1e3a8a]">
          <h3 className="font-bold text-base mb-1">
            2) Como você aplicaria os conceitos aprendidos no seu dia a dia?
          </h3>
          <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
            <p className="text-sm text-gray-800 font-medium">
              Pretendo revisar as políticas de coleta de dados da minha equipe e
              garantir que estamos pedindo apenas as informações estritamente
              necessárias para o projeto, documentando tudo no nosso sistema
              interno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
