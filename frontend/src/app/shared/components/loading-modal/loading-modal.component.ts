import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-loading-modal',
  standalone: true,
  imports: [NgbProgressbarModule, CommonModule],
  templateUrl: './loading-modal.component.html',
  styleUrl: './loading-modal.component.scss',
})
export class LoadingModalComponent {
  @Input({ required: true }) message!: string;
  @Input() message2: string | null = null;
  @Input({ required: true }) show!: boolean;
  @Input({ required: true }) processingProgress!: number;
}
