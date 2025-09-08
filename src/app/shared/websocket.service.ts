import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CBBasePacket, SBBasePacket } from './packets';
import { GameStateService } from './game-state.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly serverUrl = `${environment.backendUrl}/ws`;

  // Subject for received messages
  private messageReceived = new Subject<CBBasePacket>();

  constructor(private gameState: GameStateService) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        resolve();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.gameState.disconnect();
        reject(error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.gameState.disconnect();
      };

      this.socket.onmessage = (event) => {
        try {
          // Some packets might not have a response, so only emit if we get data
          if (event.data) {
            const packet = JSON.parse(event.data) as CBBasePacket;
            this.messageReceived.next(packet);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    });
  }

  sendPacket(packet: SBBasePacket): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.socket.send(JSON.stringify(packet));
  }

  onMessage(): Observable<CBBasePacket> {
    return this.messageReceived.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.gameState.disconnect();
  }
}