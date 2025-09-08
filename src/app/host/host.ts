import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { WebSocketService } from '../shared/websocket.service';
import { GameStateService } from '../shared/game-state.service';
import {
  SBStartLobbyPacket,
  SBNextQuestionPacket,
  SBEndQuestionPacket,
  CBLoginResponse,
  CBQuestionPacket,
  State,
  CBQuestionGradePacket
} from '../shared/packets';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-host',
  templateUrl: './host.html',
  styleUrls: ['./host.scss'],
  standalone: true,
  imports: [FormsModule, QRCodeComponent]
})
export class HostComponent implements OnInit, OnDestroy {
  lobbyCode: string = '';
  isConnecting: boolean = false;
  error: string = '';
  joinUrl: string = '';
  currentQuestionImage: string | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private wsService: WebSocketService,
    public gameState: GameStateService,
  ) {}

  ngOnInit() {
    // Generate base URL for join links
    const baseUrl = window.location.origin;
    this.joinUrl = `${baseUrl}/join`;
  }

  async onSubmit() {
    if (!this.lobbyCode) return;

    try {
      this.isConnecting = true;
      this.error = '';

      await this.wsService.connect();

      this.subscription = this.wsService.onMessage().subscribe(
        (packet) => {
          if (packet.type === 'login_response') {
            const response = packet as CBLoginResponse;
            this.gameState.updateState(response.state);
            this.joinUrl = `${window.location.origin}/join?code=${this.lobbyCode}`;
          } else if (packet.type === 'question_grade') {
            const gradePacket = packet as CBQuestionGradePacket;
            this.gameState.updateState(gradePacket.state);
          } else if (packet.type === 'question') {
            const questionPacket = packet as CBQuestionPacket;
            this.currentQuestionImage = questionPacket.question.image_url || null;
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          this.error = 'Connection error occurred';
          this.isConnecting = false;
          this.gameState.disconnect();
        }
      );

      const packet: SBStartLobbyPacket = {
        type: 'start_lobby',
        name: 'host',
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

  startQuestion() {
    const packet: SBNextQuestionPacket = {
      type: 'next_question'
    };
    this.wsService.sendPacket(packet);
  }

  endQuestion() {
    const packet: SBEndQuestionPacket = {
      type: 'end_question'
    };
    this.wsService.sendPacket(packet);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}