import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ReportImageItemBeforePrepare } from '../images-selector.component';


@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent implements OnInit {
  @Input() reportImage: ReportImageItemBeforePrepare | undefined;

  constructor(
    private domSanitizer: DomSanitizer, 
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ImageEditorComponent>) { 
  }

  ngOnInit(): void {
    //console.log('a');
  }

  cancel(): void {
      this.dialogRef.close(undefined);
  }
  clearMarks() {

  }

  save() {

  }
  
}
