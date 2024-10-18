import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-static-progressbar',
  standalone: true,
  imports: [],
  templateUrl: './static-progressbar.component.html',
  styleUrl: './static-progressbar.component.scss',
})
export class StaticProgressbarComponent {
  @Input() amount: number = 0;
  @Input() disabled: boolean = true;
  @Input() amountPercent: number = 0;
  @Input({ required: true }) unitName!: string;
  @Input() centered: boolean = false;
}
