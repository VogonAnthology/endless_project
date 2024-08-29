// import { Injectable } from '@angular/core';
// import {
//   NgbScrollSpyService,
//   NgbScrollSpyModule,
// } from '@ng-bootstrap/ng-bootstrap';

// @Injectable({
//   standalone: true,
//   imports: [NgbScrollSpyModule],
// })
// export class CustomScrollSpyService extends NgbScrollSpyService {
//   private headerHeight = 56; // Set your header height here (or calculate dynamically)

//   override scrollTo(fragment: HTMLElement, options: NgbScrollToOptions): void {
//     super.process(options);
//     const targetElement = document.getElementById(options.id);
//     if (targetElement) {
//       window.scrollTo({
//         top: targetElement.offsetTop - this.headerHeight, // Adjust scroll position by header height
//         behavior: 'smooth',
//       });
//     }
//   }
// }
