export type QuestionOption = {
    id: number;
    label: string;
    text: string;
}

export type Question = {
    id: number;
    title: string;
    right_answer?: number;
    options: QuestionOption[]
}

export type Quiz = {
    id: number;
    type: 'pre_avaliacao' | 'avaliacao' | 'feedback';
    status: 'INDISPONIVEL' | 'DISPONIVEL' | 'FINALIZADO';
    correct_answers?: number;
    min_required: number;
    questions: Question[]
}