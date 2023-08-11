import { Component, HostListener, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ReportImageItemBeforePrepare } from '../images-selector.component';
import { ImageMarkPart, ReportImageItem } from 'client/app/core/models';

export interface ImageEditorData {
  reportImage: ReportImageItem;
}

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent  {
  reportImage: ReportImageItem;
  marks: ImageMarkPart[] = [];

  constructor(
    private domSanitizer: DomSanitizer, 
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ImageEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageEditorData) { 
      this.reportImage = data.reportImage;
      this.marks = data.reportImage?.marks ?? [];
  }

  cancel(): void {
      this.dialogRef.close(undefined);
  }
  clearMarks() {
    this.marks = [];
  }

  save() {
    this.dialogRef.close(this.marks);
  }
  
  marksChange(marks: ImageMarkPart[])  {
    console.log('marksChange')
    this.marks = marks ?? [];
  }
}
