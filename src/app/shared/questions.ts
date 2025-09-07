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

export interface CurrentQuestion {
  data: MultipleChoiceQuestion | NumericalQuestion;
  type: 'multiple_choice' | 'numerical';
}

export function isMultipleChoice(question: MultipleChoiceQuestion | NumericalQuestion): question is MultipleChoiceQuestion {
  return 'options' in question;
}

export function isNumerical(question: MultipleChoiceQuestion | NumericalQuestion): question is NumericalQuestion {
  return 'answers' in question;
}
