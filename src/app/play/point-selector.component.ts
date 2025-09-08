import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PointSelectorQuestion } from '../shared/questions';

@Component({
  selector: 'app-point-selector',
  standalone: true,
  template: `
    <div class="point-selector-container" #container>
      <img [src]="question.image_url"
           (load)="onImageLoad()"
           (click)="onPointerEvent($event)"
           (touchstart)="onPointerEvent($event)"
           class="background-image">
      @if (selectedPoint) {
        <div class="point-marker"
             [style.left.px]="selectedPoint.x - 5"
             [style.top.px]="selectedPoint.y - 5">
        </div>
      }
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
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #f5f5f5;
    }

    .background-image {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      cursor: crosshair;
      touch-action: none; /* Prevent browser handling of touch events */
      -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
      user-select: none; /* Prevent text selection */
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
      margin-top: 1rem;
      font-size: 1.2rem;
      font-family: monospace;
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
    if (!this.imageRect) return;

    // Prevent default behavior for touch events (zooming, scrolling)
    if (event.type === 'touchstart') {
      event.preventDefault();
      const touch = (event as TouchEvent).touches[0];
      const x = touch.clientX - this.imageRect.left;
      const y = touch.clientY - this.imageRect.top;
      this.selectedPoint = { x, y };
    } else {
      const mouseEvent = event as MouseEvent;
      const x = mouseEvent.clientX - this.imageRect.left;
      const y = mouseEvent.clientY - this.imageRect.top;
      this.selectedPoint = { x, y };
    }
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
