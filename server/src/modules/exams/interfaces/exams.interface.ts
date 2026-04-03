export interface UpdatePaperPointsPayload {
  divideEqually?: boolean;
  pointsData?: {
    questionId: string;
    points: number;
  }[];
}
