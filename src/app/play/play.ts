import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../shared/websocket.service';
import { GameStateService } from '../shared/game-state.service';
import {
  SBLoginPacket,
  SBAnswerPacket,
  CBLoginResponse,
  CBLoginFailure,
  CBQuestionPacket,
  CBAnswerConfirmPacket,
  CBQuestionGradePacket,
  State
} from '../shared/packets';
import { Subscription } from 'rxjs';

import { CurrentQuestion, MultipleChoiceQuestion, NumericalQuestion, PointSelectorQuestion, isMultipleChoice, isNumerical, isPointSelector } from '../shared/questions';
import { PointSelectorComponent } from './point-selector.component';

@Component({
  selector: 'app-play',
  templateUrl: './play.html',
  styleUrls: ['./play.scss'],
  standalone: true,
  imports: [FormsModule, PointSelectorComponent]
})
export class PlayComponent implements OnInit, OnDestroy {
  name: string = '';
  lobbyCode: string = '';
  isConnecting: boolean = false;
  error: string = '';
  showLobbyInput: boolean = true;
  currentQuestion: CurrentQuestion | null = null;
  selectedOption: string | null = null;
  numericalAnswers: string[] = [];
  questionGrade: boolean | null = null;
  answerSubmitted: boolean = false;
  private subscription: Subscription | null = null;

  constructor(
    private wsService: WebSocketService,
    public gameState: GameStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check for lobby code in query params
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.lobbyCode = params['code'];
        this.showLobbyInput = false;
      }
    });
  }

  async onSubmit() {
    if (!this.name || !this.lobbyCode) return;

    try {
      this.isConnecting = true;
      this.error = '';

      await this.wsService.connect();

      this.subscription = this.wsService.onMessage().subscribe(
        (packet) => {
          if (packet.type === 'login_response') {
            const response = packet as CBLoginResponse;
            this.gameState.updateState(response.state);

            switch (response.state) {
              case State.Waiting:
                this.currentQuestion = null;
                this.selectedOption = null;
                this.numericalAnswers = [];
                this.questionGrade = null;
                this.answerSubmitted = false;
                break;
              case State.Question:
                this.questionGrade = null;
                this.answerSubmitted = false;
                break;
              case State.Finished:
                this.error = 'Activity has finished';
                this.currentQuestion = null;
                break;
            }
          } else if (packet.type === 'login_failure') {
            const failure = packet as CBLoginFailure;
            this.error = failure.message;
            this.isConnecting = false;
          } else if (packet.type === 'question') {
            const questionPacket = packet as CBQuestionPacket;
            this.currentQuestion = {
              data: questionPacket.question as any,
              type: questionPacket.question_type
            };
            this.selectedOption = null;
            this.numericalAnswers = [];
            this.questionGrade = null;
            this.answerSubmitted = false;
          } else if (packet.type === 'answer_confirm') {
            this.answerSubmitted = true;
          } else if (packet.type === 'question_grade') {
            const gradePacket = packet as CBQuestionGradePacket;
            this.questionGrade = gradePacket.is_correct;
            this.gameState.updateState(gradePacket.state);
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          this.error = 'Connection error occurred';
          this.isConnecting = false;
          this.gameState.disconnect();
        }
      );

      const packet: SBLoginPacket = {
        type: 'login',
        name: this.name,
        lobby_code: this.lobbyCode
      };
      this.wsService.sendPacket(packet);

    } catch (error) {
      console.error('Failed to connect:', error);
      this.error = 'Failed to connect to server';
      this.isConnecting = false;
      this.gameState.disconnect();
    }
  }

  selectOption(index: string) {
    if (!this.answerSubmitted) {
      this.selectedOption = index;
    }
  }

  hasValidAnswer(): boolean {
    if (!this.currentQuestion) return false;

    if (this.currentQuestion.type === 'multiple_choice') {
      return this.selectedOption !== null;
    } else if (this.currentQuestion.type === 'numerical') {
      const numQuestion = this.currentQuestion.data as NumericalQuestion;
      if (this.numericalAnswers.length !== numQuestion.answers.length) {
        return false;
      }
      return this.numericalAnswers.every(answer =>
        answer !== null && answer !== '' && !isNaN(Number(answer))
      );
    } else if (this.currentQuestion.type === 'point_selector') {
      // Get reference to point selector component
      const pointSelector = document.querySelector('app-point-selector') as any;
      return pointSelector?.selectedPoint !== null;
    }
    return false;
  }

  submitAnswer(pointCoordinates?: [number, number]) {
    if (!this.currentQuestion || this.answerSubmitted) {
      return;
    }

    // For point selector, we use the coordinates directly
    if (this.currentQuestion.type === 'point_selector' && pointCoordinates) {
      const [x, y] = pointCoordinates;
      const packet: SBAnswerPacket = {
        type: 'answer',
        answers: [x.toString(), y.toString()]
      };
      this.wsService.sendPacket(packet);
      this.answerSubmitted = true;
      return;
    }

    // For other question types, check if we have valid answers
    if (!this.hasValidAnswer()) {
      return;
    }

    const answers = this.currentQuestion.type === 'multiple_choice'
      ? [this.selectedOption!]
      : this.numericalAnswers.map(answer => answer.toString());

    const packet: SBAnswerPacket = {
      type: 'answer',
      answers: answers
    };

    this.wsService.sendPacket(packet);
    this.answerSubmitted = true;
  }

  parseOptionIndex(index: string | null): number {
    return parseInt(index ?? '0');
  }

  isMultipleChoice(question: any): question is MultipleChoiceQuestion {
    return isMultipleChoice(question);
  }

  isNumerical(question: any): question is NumericalQuestion {
    return isNumerical(question);
  }

  isPointSelector(question: any): question is PointSelectorQuestion {
    return isPointSelector(question);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}