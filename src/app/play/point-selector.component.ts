import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PointSelectorQuestion } from '../shared/questions';

@Component({
  selector: 'app-point-selector',
  standalone: true,
  template: `
    <div class="point-selector-container" #container>
      <div class="image-container">
        <img [src]="question.image_url"
             (load)="onImageLoad()"
             class="background-image"
             #img>
        <div class="click-overlay"
             (click)="onPointerEvent($event)"
             (touchstart)="onPointerEvent($event)">
        </div>
        @if (selectedPoint) {
          <div class="point-marker"
               [style.left.px]="selectedPoint.x - 5"
               [style.top.px]="selectedPoint.y - 5">
          </div>
        }
      </div>
      <div class="coordinates">
        {{ question.x_comp }}: {{ selectedPoint?.x || '?' }},
        {{ question.y_comp }}: {{ selectedPoint?.y || '?' }}
      </div>
    </div>
  `,
  styles: [`
    .point-selector-container {
      position: relative;
      width: 100%;
      height: calc(100vh - 150px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      background-color: #f5f5f5;
      padding: 1rem;
      box-sizing: border-box;
    }

    .image-container {
      position: relative;
      max-width: 100%;
      max-height: calc(100vh - 250px);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .background-image {
      max-width: 100%;
      max-height: calc(100vh - 250px);
      width: auto;
      height: auto;
      object-fit: contain;
      user-select: none;
    }

    .click-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      cursor: crosshair;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }

    .point-marker {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: red;
      border-radius: 50%;
      pointer-events: none;
    }

    .coordinates {
      font-size: 1.1rem;
      font-family: monospace;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
    }

  `]
})
export class PointSelectorComponent implements AfterViewInit {
  @Input() question!: PointSelectorQuestion;
  @Output() submit = new EventEmitter<[number, number]>();
  @ViewChild('container') containerRef!: ElementRef;

  selectedPoint: { x: number, y: number } | null = null;
  private imageRect: DOMRect | null = null;

  ngAfterViewInit() {
    // Initial setup after view is ready
    this.updateImageRect();
  }

  onImageLoad() {
    // Update measurements when image loads
    this.updateImageRect();
  }

  private updateImageRect() {
    const img = this.containerRef.nativeElement.querySelector('img');
    if (img) {
      this.imageRect = img.getBoundingClientRect();
    }
  }

  onPointerEvent(event: MouseEvent | TouchEvent) {
    const overlay = event.target as HTMLElement;
    const rect = overlay.getBoundingClientRect();

    let x: number, y: number;

    if (event.type === 'touchstart') {
      event.preventDefault();
      const touch = (event as TouchEvent).touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      const mouseEvent = event as MouseEvent;
      x = mouseEvent.offsetX;
      y = mouseEvent.offsetY;
    }

    this.selectedPoint = { x, y };
  }

  onSubmit() {
    if (this.selectedPoint && this.imageRect) {
      // Convert pixel coordinates to normalized coordinates (0-1)
      const normalizedX = this.selectedPoint.x / this.imageRect.width;
      const normalizedY = this.selectedPoint.y / this.imageRect.height;
      this.submit.emit([normalizedX, normalizedY]);
    }
  }
}
