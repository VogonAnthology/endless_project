import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from 'express';
import { UploadedVideoService } from '../../services/uploading-video/video.service';

@Component({
  selector: 'app-choose-submit-plan-page',
  standalone: true,
  imports: [],
  templateUrl: './choose-submit-plan-page.component.html',
  styleUrl: './choose-submit-plan-page.component.scss',
})
export class ChooseSubmitPlanPageComponent {
  @ViewChild('contest') contestCard!: ElementRef;
  @ViewChild('payment') paymentCard!: ElementRef;
  @Output() plan = new EventEmitter<string>();
  private _plan: string = '';

  submitForContest(): void {
    console.log('submitForContest');
    this.plan.emit('contest');
    this._plan = 'contest';
    this.addSelectedCardStyle();
  }

  submitWithPayment(): void {
    console.log('submitWithPayment');
    this.plan.emit('payment');
    this._plan = 'payment';
    this.addSelectedCardStyle();
  }

  addSelectedCardStyle(): void {
    if (this._plan === 'contest') {
      this.contestCard.nativeElement.classList.add('gradient-outline');
      this.paymentCard.nativeElement.classList.remove('gradient-outline');
    } else if (this._plan === 'payment') {
      this.contestCard.nativeElement.classList.remove('gradient-outline');
      this.paymentCard.nativeElement.classList.add('gradient-outline');
    } else {
      this.contestCard.nativeElement.classList.remove('gradient-outline');
      this.paymentCard.nativeElement.classList.remove('gradient-outline');
    }
  }

  resetCardStyle(): void {
    this._plan = '';
    this.addSelectedCardStyle();
  }
}
