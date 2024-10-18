import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-scroll-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-container.component.html',
  styleUrls: ['./scroll-container.component.scss'],
  host: { ngSkipHydration: 'true' },
})
export class ScrollContainerComponent implements AfterViewInit {
  @Input() contentTemplate!: TemplateRef<any>;
  @Input() context: any;
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef;
  @ViewChild('topGradient', { static: true }) topGradient!: ElementRef;
  @ViewChild('bottomGradient', { static: true }) bottomGradient!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const container = this.scrollWrapper.nativeElement;

    this.updateGradientVisibility(container);

    container.addEventListener('scroll', () => {
      this.updateGradientVisibility(container);
    });
  }

  updateGradientVisibility(container: HTMLElement) {
    const isOverflowing = container.scrollHeight > container.clientHeight;

    if (isOverflowing) {
      const scrolledToTop = container.scrollTop === 0;
      const scrolledToBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight;

      this.renderer.setStyle(
        this.topGradient.nativeElement,
        'opacity',
        scrolledToTop ? '0' : '1'
      );

      this.renderer.setStyle(
        this.bottomGradient.nativeElement,
        'opacity',
        scrolledToBottom ? '0' : '1'
      );
    } else {
      this.renderer.setStyle(this.topGradient.nativeElement, 'opacity', '0');
      this.renderer.setStyle(this.bottomGradient.nativeElement, 'opacity', '0');
    }
  }
}
