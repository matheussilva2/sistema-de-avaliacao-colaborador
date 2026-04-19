export type Question = {
    id: number;
    question: string;
}

export type Quiz = {
    id: number;
    right_answer?: number;
    status: 'INDISPONIVEL' | 'DISPONIVEL' | 'FINALIZADO';
    correct_answers?: number;
    min_required: number;
    questions: Question[]
}