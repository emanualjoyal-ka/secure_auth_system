export interface sessionDetails {
    id: string;
    userAgent: string | null;
    createdAt: Date;
    expiresAt: Date;
    currentSession?: boolean;
}


export type PaginationDTO = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type AllSessionsDtoResponse = {
    data: sessionDetails[];
    pagination: PaginationDTO;
};
