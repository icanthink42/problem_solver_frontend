export interface Answer {
  value: string;
  tolerance: number;
}

export interface BaseQuestion {
  question: string;
  image_url?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  options: string[];
}

export interface NumericalQuestion extends BaseQuestion {
  answers: Answer[];
  type: 'int' | 'float';
}

export interface PointSelectorQuestion extends BaseQuestion {
  image_url: string;  // Required for point selector
  x_comp: string;     // Label for x component
  y_comp: string;     // Label for y component
}

export type QuestionData = MultipleChoiceQuestion | NumericalQuestion | PointSelectorQuestion;

export interface CurrentQuestion {
  data: QuestionData;
  type: 'multiple_choice' | 'numerical' | 'point_selector';
}

// Type guard for multiple choice questions
export function isMultipleChoice(question: QuestionData): question is MultipleChoiceQuestion {
  return 'options' in question && !('answers' in question) && !('x_comp' in question);
}

// Type guard for numerical questions
export function isNumerical(question: QuestionData): question is NumericalQuestion {
  return 'answers' in question && !('options' in question) && !('x_comp' in question);
}

// Type guard for point selector questions
export function isPointSelector(question: QuestionData): question is PointSelectorQuestion {
  return 'x_comp' in question && !('options' in question) && !('answers' in question);
}