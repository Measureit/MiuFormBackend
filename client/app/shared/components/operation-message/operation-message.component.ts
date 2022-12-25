import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-operation-message',
  templateUrl: './operation-message.component.html',
  styleUrls: ['./operation-message.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OperationMessageComponent implements OnInit {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string) {}

  ngOnInit(): void {}
}
