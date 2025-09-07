// Server-bound packets (packets we send)
export interface SBBasePacket {
  type: string;
}

export interface SBLoginPacket extends SBBasePacket {
  type: 'login';
  name: string;
  lobby_code: string;
}

export interface SBStartLobbyPacket extends SBBasePacket {
  type: 'start_lobby';
  name: string;
  lobby_code: string;
}

export interface SBNextQuestionPacket extends SBBasePacket {
  type: 'next_question';
}

export interface SBEndQuestionPacket extends SBBasePacket {
  type: 'end_question';
}

export interface SBAnswerPacket extends SBBasePacket {
  type: 'answer';
  answers: string[];
}

// Client-bound packets (packets we receive)
export enum State {
  Waiting = 'waiting',
  Question = 'question',
  QuestionReview = 'question_review',
  Finished = 'finished'
}

export interface CBBasePacket {
  type: string;
}

export interface CBLoginResponse extends CBBasePacket {
  type: 'login_response';
  state: State;
  is_host: boolean;
}

export interface CBLoginFailure extends CBBasePacket {
  type: 'login_failure';
  message: string;
}

import { BaseQuestion } from './questions';

export interface CBQuestionPacket extends CBBasePacket {
  type: 'question';
  question: BaseQuestion;
  question_type: 'multiple_choice' | 'numerical';
}

export interface CBAnswerConfirmPacket extends CBBasePacket {
  type: 'answer_confirm';
}

export interface CBQuestionGradePacket extends CBBasePacket {
  type: 'question_grade';
  is_correct: boolean;
  state: State;
}