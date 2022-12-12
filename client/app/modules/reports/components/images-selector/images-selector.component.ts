import { Component, Input, OnInit } from '@angular/core';
import { first, map, mergeMap, Observable, tap, zip } from 'rxjs';
import { FactoryInfoConfig, ImageSize, Report, ReportImageItem } from 'client/app/core/models';
import { blobToBase64, ReportService } from 'client/app/core/services';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

interface ReportImageItemBeforePrepare {
  blob: Blob;
  size: ImageSize;
}
@Component({
  selector: 'app-images-selector',
  templateUrl: './images-selector.component.html',
  styleUrls: ['./images-selector.component.scss']
})
export class ImagesSelectorComponent implements OnInit {
  @Input('parentImagesFormGroup') parentImagesFormGroup: FormGroup;
  @Input('imagesFormArrayName') imagesFormArrayName: string;
  @Input('imagesFormArray') imagesFormArray: FormArray;
  
  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    //console.log('a');
  }

  get selectedImages() : FormGroup[] {
    return (this.imagesFormArray.controls ?? []).map(x => x as FormGroup).filter(x => x && x.get('selected').value as boolean === true);
  }
  selectImage(formGroup) {
    const fg = formGroup as FormGroup;
    const isSelected = fg.get('selected').value as boolean ?? false;
    fg.get('selected').setValue(!isSelected);
  }
  deleteSelected() {
    this.selectedImages.forEach(x => {
      const index = this.imagesFormArray.controls.indexOf(x, 0);
      if (index > -1) {
        this.imagesFormArray.controls.splice(index, 1);
      }
    });
  }

  onFileInput = (event) => {
    console.log('aaa');
    if (event.target.files && event.target.files.length > 0) {
      zip(
        Array.from<File>(event.target.files)
          .map(y => this.resizeImage(y, 1200, 1200)))        
        .subscribe({
          next:  (y) => { 
            console.log(y);
            //let cur = (this.itemForm.get('images').value ?? []) as Array<ReportImageItem>;
            //let newArray = cur.concat(y);
            //this.itemForm.get('images').reset();
            y.forEach(async x => this.imagesFormArray.push(new FormGroup({
              'selected': new FormControl(false),
              'base64': new FormControl(await blobToBase64(x.blob)),
              'size': new FormControl(x.size),
            })));
            console.log(this.imagesFormArray)
          },
          error: (err) => { console.error(err); }
        });
    }
  }

  // blobToSrc(blob: Blob): SafeUrl {
  //   console.log('blobToSrc: ' + blob );
  //   return this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  // }

  
  resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<ReportImageItemBeforePrepare> {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (width <= maxWidth && height <= maxHeight) {
          resolve({ blob: file, size: { width, height } });
        }

        let newWidth: number;
        let newHeight: number;

        if (width > height) {
          newHeight = height * (maxWidth / width);
          newWidth = maxWidth;
        } else {
          newWidth = width * (maxHeight / height);
          newHeight = maxHeight;
        }

        let canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        let context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, newWidth, newHeight);
        let resolve2 = (a: Blob): void => {
          resolve({ blob: a, size: { width: newWidth, height: newHeight }} as ReportImageItemBeforePrepare);
        }
        canvas.toBlob(resolve2, file.type)
      };
      image.onerror = reject;
    });
  }
}
