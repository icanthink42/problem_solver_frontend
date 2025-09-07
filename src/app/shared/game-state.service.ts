import { Injectable, signal } from '@angular/core';
import { State } from './packets';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly _state = signal<State | 'disconnected'>('disconnected');

  get state() {
    return this._state();
  }

  updateState(newState: State) {
    this._state.set(newState);
  }

  disconnect() {
    this._state.set('disconnected');
  }
}
