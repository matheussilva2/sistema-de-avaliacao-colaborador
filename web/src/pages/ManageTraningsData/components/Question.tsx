export const Question = () => {
    return (
        <div className="mb-8 p-4 border-2 border-primary-200 rounded-lg bg-blue-50">
            <p className="font-bold text-neutral-900 mb-4 text-base">1) O que é a LGPD?</p>

            {/* Opções de resposta */}
            <div className="space-y-3">
                {/* Opção 1 - Neutra */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                    <input type="radio" className="mt-1" disabled />
                    <div className="flex items-start gap-2 w-full">
                        <span className="text-neutral-400 text-lg mt-1">●</span>
                        <span className="text-neutral-700">Um sistema de segurança cibernética criado pelo governo federal para proteger redes de computadores contra ataques.</span>
                    </div>
                </div>

                {/* Opção 2 - Verde (Correta) */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-100 border-2 border-green-300">
                    <input type="radio" className="mt-1" disabled />
                    <div className="flex items-start gap-2 w-full">
                        <span className="text-green-600 text-lg mt-1">✓</span>
                        <span className="text-neutral-900 font-medium">Uma lei brasileira que regula a coleta, o armazenamento e o uso de dados pessoais por empresas e órgãos públicos.</span>
                    </div>
                </div>

                {/* Opção 3 - Neutra */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 border-2 border-neutral-300">
                    <input type="radio" className="mt-1" disabled />
                    <div className="flex items-start gap-2 w-full">
                        <span className="text-neutral-400 text-lg mt-1">●</span>
                        <span className="text-neutral-700">Um protocolo internacional de criptografia adotado pelo Brasil para garantir a segurança de transações de empresas e órgãos públicos.</span>
                    </div>
                </div>

                {/* Opção 4 - Rosa/Vermelha (Incorreta) */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-pink-100 border-2 border-pink-300">
                    <input type="radio" className="mt-1" disabled />
                    <div className="flex items-start gap-2 w-full">
                        <span className="text-pink-600 text-lg mt-1">✕</span>
                        <span className="text-neutral-900 font-medium">Uma norma técnica da ABNT que estabelece padrões de qualidade de software desenvolvidos no território nacional. (Sua resposta)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}