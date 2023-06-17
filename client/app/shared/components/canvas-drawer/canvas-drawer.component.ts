import {
    Component,
    Input,
    ElementRef,
    AfterViewInit,
    ViewChild,
    HostListener,
  } from '@angular/core';
  import { fromEvent } from 'rxjs';
  import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
  
  @Component({
    selector: 'app-canvas-drawer',
    templateUrl: './canvas-drawer.component.html',
  styleUrls: ['./canvas-drawer.component.scss']
  })
  export class CanvasDrawerComponent implements AfterViewInit {
    @ViewChild('canvas') public canvas: ElementRef | undefined;
  
    //@Input() public width = 400;
   //@Input() public height = 400;
  
    allowWidth: number = -1;
    allowHeigh: number = -1;
    @HostListener('window:resize')
    onResize() {
      //event.target.innerWidth;
      this.allowHeigh = window.screen.height;
      this.allowWidth = window.screen.width;
      
    }

    private cx: CanvasRenderingContext2D | null | undefined;
  
    public ngAfterViewInit() {
      this.onResize();
      
      const canvasEl: HTMLCanvasElement = this.canvas?.nativeElement;
  
      this.cx = canvasEl.getContext('2d');
  
      //canvasEl.width = this.width;
      //canvasEl.height = this.height;
  
      if (!this.cx) throw 'Cannot get context';
  
      this.cx.lineWidth = 3;
      this.cx.lineCap = 'round';
      this.cx.strokeStyle = '#000';
  
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
        this.cx.moveTo(prevPos.x, prevPos.y); // from
        this.cx.lineTo(currentPos.x, currentPos.y);
        this.cx.stroke();
      }
    }
  }
  