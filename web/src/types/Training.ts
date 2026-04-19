import type { Quiz } from "./Quiz";

export type Training = {
    id: number;
    title: string;
    hours: number;
    progress: number;
    startDate: string;
    endDate: string;
    daysLeft: number;
    status: "em_breve" | "em_andamento" | "pre_avaliacao" | "avaliacao" | "aguardando_feedback" | "concluido" | "pendencia";
    pretest?: Quiz;
    test?: Quiz;
    avaliation?: Quiz;
};