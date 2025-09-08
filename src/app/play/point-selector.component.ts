import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PointSelectorQuestion } from '../shared/questions';

@Component({
  selector: 'app-point-selector',
  standalone: true,
  template: `
    <div class="point-selector-container"
         (click)="onPointerEvent($event)"
         (touchstart)="onTouchEvent($event)"
         (touchmove)="$event.preventDefault()"
         (touchend)="$event.preventDefault()">
      <img [src]="question.image_url"
           class="background-image"
           (dragstart)="$event.preventDefault()">
      @if (selectedPoint) {
        <div class="point-marker"
             [style.left.px]="selectedPoint.x - 5"
             [style.top.px]="selectedPoint.y - 5">
        </div>
      }
    </div>
  `,
  styles: [`
    .point-selector-container {
      position: relative;
      display: inline-block;
      cursor: crosshair;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      width: 100%;
      max-width: 100vw;
      text-align: center;
    }

    .background-image {
      max-height: 70vh;
      max-width: 100%;
      width: auto;
      height: auto;
      display: block;
      margin: 0 auto;
      -webkit-user-drag: none;
      user-drag: none;
    }

    .point-marker {
      position: absolute;
      width: 20px;
      height: 20px;
      background-color: rgba(255, 0, 0, 0.6);
      border: 2px solid red;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
    }
  `]
})
export class PointSelectorComponent {
  @Input() question!: PointSelectorQuestion;
  @Output() submit = new EventEmitter<[number, number]>();
  selectedPoint: { x: number, y: number } | null = null;

  private getCoordinates(clientX: number, clientY: number, container: HTMLElement, img: HTMLImageElement) {
    const rect = container.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Account for scroll position and get position relative to the container
    const x = (clientX + scrollLeft - rect.left);
    const y = (clientY + scrollTop - rect.top);

    // Get the actual displayed image dimensions
    const displayedWidth = img.offsetWidth;
    const displayedHeight = img.offsetHeight;

    // Calculate the offset if the image is centered
    const imageLeft = (container.offsetWidth - displayedWidth) / 2;

    // Adjust coordinates relative to the actual image position
    const adjustedX = x - imageLeft;
    const adjustedY = y;

    return {
      x: Math.max(0, Math.min(adjustedX, displayedWidth)),
      y: Math.max(0, Math.min(adjustedY, displayedHeight))
    };
  }

  onPointerEvent(event: MouseEvent) {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
    if (!img) return;

    this.selectedPoint = this.getCoordinates(event.clientX, event.clientY, container, img);
  }

  onTouchEvent(event: TouchEvent) {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
    if (!img || !event.touches.length) return;

    const touch = event.touches[0];
    this.selectedPoint = this.getCoordinates(touch.clientX, touch.clientY, container, img);
  }

  onSubmit() {
    if (!this.selectedPoint) return;
    const container = document.querySelector('.point-selector-container') as HTMLElement;
    const img = container?.querySelector('img') as HTMLImageElement;
    if (!container || !img) return;

    // Get the actual displayed image dimensions
    const displayedWidth = img.offsetWidth;
    const displayedHeight = img.offsetHeight;

    // Normalize coordinates relative to the image dimensions
    const normalizedX = this.selectedPoint.x / displayedWidth;
    const normalizedY = this.selectedPoint.y / displayedHeight;

    // Ensure values are between 0 and 1
    const clampedX = Math.max(0, Math.min(1, normalizedX));
    const clampedY = Math.max(0, Math.min(1, normalizedY));

    this.submit.emit([clampedX, clampedY]);
  }
}
