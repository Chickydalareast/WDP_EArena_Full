import { DifficultyLevel } from '../schemas/question.schema';
import { DIFFICULTY_WEIGHT_MAP } from '../constants/question.constant';


export function calculatePassageDifficulty(
    subQuestions: { difficultyLevel?: DifficultyLevel }[]
): DifficultyLevel {
    if (!subQuestions || subQuestions.length === 0) {
        return DifficultyLevel.UNKNOWN;
    }

    let maxWeight = -1;
    let highestDifficulty = DifficultyLevel.UNKNOWN;

    for (const sub of subQuestions) {
        const level = sub.difficultyLevel || DifficultyLevel.UNKNOWN;
        const currentWeight = DIFFICULTY_WEIGHT_MAP[level];

        if (currentWeight > maxWeight) {
            maxWeight = currentWeight;
            highestDifficulty = level;
        }
    }

    return highestDifficulty;
}