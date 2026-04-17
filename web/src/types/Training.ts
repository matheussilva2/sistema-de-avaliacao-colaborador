export type Training = {
    id: number;
    title: string;
    hours: number;
    progress: number;
    startDate: string;
    endDate: string;
    daysLeft: number;
    status: "em_andamento" | "pre_avaliacao" | "avaliacao" | "aguardando_feedback" | "concluido" | "pendencia";
};