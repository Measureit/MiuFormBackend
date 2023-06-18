import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  ViewChild,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { ImageMarkPart, ReportImageItem } from 'client/app/core/models';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { calculateCanvasSize, clearMarksOnCanvas, drawMarksOnCanvas } from '../../image.helper';



@Component({
  selector: 'app-canvas-drawer',
  templateUrl: './canvas-drawer.component.html',
  styleUrls: ['./canvas-drawer.component.scss'],
})
export class CanvasDrawerComponent implements AfterViewInit {
  @ViewChild('canvas') public canvas: ElementRef | undefined;
  @ViewChild('div') public div: ElementRef | undefined;

    
  private factor: number | undefined;
  private cx: CanvasRenderingContext2D | null | undefined;

  private _marks: ImageMarkPart[] = []
  
  get marks(): ImageMarkPart[] {
    return this._marks;
  }
  @Input() set marks(value: ImageMarkPart[] | undefined) {
    this._marks = value ?? [];
    if (this.cx != undefined) {
      clearMarksOnCanvas(this.cx, this.reportImage?.base64, (crc: CanvasRenderingContext2D) => drawMarksOnCanvas(crc, this.marks, this.factor));
    }
    console.log('set marks')
  } 
  @Input() reportImage: ReportImageItem | undefined;
  @Output() marksChange= new EventEmitter<ImageMarkPart[]>();

  @HostListener('window:resize')
  onResize() {
    const divEl: HTMLCanvasElement = this.div?.nativeElement;
    const canvasEl: HTMLCanvasElement = this.canvas?.nativeElement;

    var allowHeigh = divEl.clientHeight;
    var allowWidth = divEl.clientWidth;

    var newSize = calculateCanvasSize(
      allowWidth,
      allowHeigh,
      this.reportImage?.size
    );

    this.factor = undefined;

    canvasEl.width = newSize.width;
    canvasEl.height = newSize.height;

    if (
      this.cx != undefined &&
      this.reportImage.base64 !== undefined &&
      this.reportImage.size !== undefined &&
      this.reportImage.size.height > 0 &&
      this.reportImage.size.width > 0
    ) {
      this.factor = newSize.height / this.reportImage.size.height;

      this.cx.lineWidth = 3;
      this.cx.lineCap = 'round';
      this.cx.strokeStyle = '#000';

      clearMarksOnCanvas(this.cx, this.reportImage?.base64, (crc: CanvasRenderingContext2D) => drawMarksOnCanvas(crc, this.marks, this.factor));
    }
  }

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas?.nativeElement;

    this.cx = canvasEl?.getContext('2d');

    if (!this.cx) throw 'Cannot get context';

    this.onResize();

    this.captureEvents(canvasEl);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'touchstart')
      .pipe(
        switchMap((e) => {
          console.log('1: ' + JSON.stringify(e));
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'touchmove').pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a 'mouseup' event
            takeUntil(fromEvent(canvasEl, 'touchend')),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
            //takeUntil(fromEvent(canvasEl, 'mouseleave')),
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        })
      )
      .subscribe((res) => {
        const rect = canvasEl.getBoundingClientRect();

        const prevMouseEvent = res[0] as TouchEvent;
        const currMouseEvent = res[1] as TouchEvent;
        // previous and current position with the offset
        const prevPos = {
          x: prevMouseEvent.touches[0].clientX - rect.left,
          y: prevMouseEvent.touches[0].clientY - rect.top,
        };

        const currentPos = {
          x: currMouseEvent.touches[0].clientX - rect.left,
          y: currMouseEvent.touches[0].clientY - rect.top,
        };

        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });

    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove').pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a 'mouseup' event
            takeUntil(fromEvent(canvasEl, 'mouseup')),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
            takeUntil(fromEvent(canvasEl, 'mouseleave')),
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        })
      )
      .subscribe((res) => {
        const rect = canvasEl.getBoundingClientRect();
        const prevMouseEvent = res[0] as MouseEvent;
        const currMouseEvent = res[1] as MouseEvent;

        // previous and current position with the offset
        const prevPos = {
          x: prevMouseEvent.clientX - rect.left,
          y: prevMouseEvent.clientY - rect.top,
        };

        const currentPos = {
          x: currMouseEvent.clientX - rect.left,
          y: currMouseEvent.clientY - rect.top,
        };

        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    if (!this.cx) {
      return;
    }

    this.cx.beginPath();

    if (prevPos) {
      var x1 = prevPos.x / (this.cx.canvas.clientWidth / this.cx.canvas.width);
      var y1 =
        prevPos.y / (this.cx.canvas.clientHeight / this.cx.canvas.height);
      var x2 =
        currentPos.x / (this.cx.canvas.clientWidth / this.cx.canvas.width);
      var y2 =
        currentPos.y / (this.cx.canvas.clientHeight / this.cx.canvas.height);
      this.cx.moveTo(x1, y1); // from
      this.cx.lineTo(x2, y2);
      this.cx.stroke();

      this.addImageMarkPart(
        x1 * this.factor,
        y1 * this.factor,
        x2 * this.factor,
        y2 * this.factor
      );
    }
  }
  
  addImageMarkPart(x1: number, y1: number, x2: number, y2: number) {
    if (this.marks != undefined) {
      this.marks.push({ x1, y1, x2, y2 });
      this.marksChange.emit(this.marks);
    }
  }
}


