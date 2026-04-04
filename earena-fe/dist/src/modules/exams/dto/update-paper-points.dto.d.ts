declare class PointDataDto {
    questionId: string;
    points: number;
}
export declare class UpdatePaperPointsDto {
    divideEqually?: boolean;
    pointsData?: PointDataDto[];
}
export {};
