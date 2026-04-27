export const PreTeste = () => {
  return (
    <div className="w-full flex flex-col font-sans">
      <div className="bg-[#8ab4f8] text-[#1e3a8a] font-bold px-6 py-3 rounded-t-lg">
        Pré-teste - Resultado
      </div>
      <div className="bg-[#eef4fe] p-6 rounded-b-lg flex flex-col gap-6">
        <div className="flex gap-4 mb-2">
          <div className="bg-[#7aa7f7] text-[#0f276b] px-4 py-3 rounded-md flex-1">
            <p className="text-sm">Acertos</p>
            <p className="font-bold text-lg">3 de 5</p>
          </div>
          <div className="bg-[#7aa7f7] text-[#0f276b] px-4 py-3 rounded-md flex-1">
            <p className="text-sm">Mínimo Exigido</p>
            <p className="font-bold text-lg">0 de 5</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-[#1e3a8a]">
          <h3 className="font-bold text-base mb-1">1) O que é a LGPD?</h3>
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
              Um sistema de segurança cibernética criado pelo governo federal
              para proteger redes de computadores contra ataques.
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
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="#34a853"
                  stroke="none"
                ></circle>
                <path
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12.5l3 3 6-6"
                ></path>
              </svg>
            </div>
            <p className="text-sm font-medium">
              Uma lei brasileira que regula a coleta, o armazenamento e o uso de
              dados pessoais por empresas e órgãos públicos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
