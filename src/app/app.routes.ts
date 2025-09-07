import { Routes } from '@angular/router';
import { PlayComponent } from './play/play';
import { HostComponent } from './host/host';

export const routes: Routes = [
  { path: 'join', component: PlayComponent },
  { path: 'host', component: HostComponent },
  { path: '**', redirectTo: 'join' }
];