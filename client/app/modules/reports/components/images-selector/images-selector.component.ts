import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageMarkPart, ImageSize } from 'client/app/core/models';
import { blobToBase64 } from 'client/app/core/services';
import { first, tap, zip } from 'rxjs';
import { ImageEditorComponent, ImageEditorData } from './image-editor/image-editor.component';
import { calculateCanvasSize, clearMarksOnCanvas, drawMarksOnCanvas } from 'client/app/shared/image.helper';

export interface ReportImageItemBeforePrepare {
  blob: Blob;
  size: ImageSize;
}
@Component({
  selector: 'app-images-selector',
  templateUrl: './images-selector.component.html',
  styleUrls: ['./images-selector.component.scss']
})
export class ImagesSelectorComponent implements OnInit {
  @Input() parentImagesFormGroup: FormGroup;
  @Input() imagesFormArrayName: string;
  @Input() imagesFormArray: FormArray;

  constructor(private formBuilder: FormBuilder, private dialog: MatDialog) { }

  ngOnInit(): void {
    //console.log('a');
  }

  get selectedImages(): FormGroup[] {
    return (this.imagesFormArray.controls ?? []).map(x => x as FormGroup).filter(x => x && x.get('selected').value as boolean === true);
  }
  selectImage(formGroup) {
    const fg = formGroup as FormGroup;
    const isSelected = fg.get('selected').value as boolean ?? false;
    fg.get('selected').setValue(!isSelected);
  }
  editSelected() {
    if (this.selectedImages.length === 1) {
      return this.dialog.open(ImageEditorComponent, {
        width: '90%',
        height: '90%',
        data: {
          reportImage: this.selectedImages[0].getRawValue() as ImageEditorData
        } ,
      })
      .afterClosed()
      .pipe(
        first(),
        //tap(res => this.logger.debug(`The dialog was closed with result ${res}, action ${action}`)),
      )
      .subscribe({
        next: (x) => {
          if (x != undefined && Array.isArray(x)) {
            //presed ok
            this.selectedImages[0].setControl('marks', this.formBuilder.array(x || []));
          }
        }
      })
    }
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
    if (event.target.files && event.target.files.length > 0) {
      zip(
        Array.from<File>(event.target.files)
          .map(y => this.resizeImage(y, 1200, 1200)))
        .subscribe({
          next:  (y) => {
            //console.log(y);
            //let cur = (this.itemForm.get('images').value ?? []) as Array<ReportImageItem>;
            //let newArray = cur.concat(y);
            //this.itemForm.get('images').reset();
            y.forEach(async x => this.imagesFormArray.push(new FormGroup({
              selected: new FormControl(false),
              base64: new FormControl(await blobToBase64(x.blob)),
              size: new FormControl(x.size),
              marks: new FormControl([]),              
            })));
            //console.log(this.imagesFormArray)
          },
          error: (err) => { console.error(err); }
        });
    }
  };

  // blobToSrc(blob: Blob): SafeUrl {
  //   console.log('blobToSrc: ' + blob );
  //   return this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  // }

  prepareImageWithMarks(imageAsBase64: string, marks: ImageMarkPart[], imageSize: ImageSize) : string {
//TODO: wartość powinna być zapisana raz w formularzu, a nie generowana za kazdym razem!
    // var canvas=document.createElement("canvas") as HTMLCanvasElement;
    // var crc=canvas.getContext("2d");

    // var newSize = calculateCanvasSize(
    //   200,
    //   200,
    //   imageSize
    // );
    
    // clearMarksOnCanvas(crc, imageAsBase64, (crc: CanvasRenderingContext2D) => drawMarksOnCanvas(crc, marks, imageSize));
    
    // var res = canvas.toDataURL("image/png")
    // return res;

    return imageAsBase64;
  } 
  resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<ReportImageItemBeforePrepare> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        const width = image.width;
        const height = image.height;

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

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, newWidth, newHeight);
        const resolve2 = (a: Blob): void => {
          resolve({ blob: a, size: { width: newWidth, height: newHeight }} as ReportImageItemBeforePrepare);
        };
        canvas.toBlob(resolve2, file.type);
      };
      image.onerror = reject;
    });
  }
}
