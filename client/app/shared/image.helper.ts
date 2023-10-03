import { ImageMarkPart, ImageSize } from "../core/models"

export const calculateCanvasSize = (maxWidth: number, maxHeight: number, imageSize: ImageSize): ImageSize => {
    if (maxWidth > 0 && maxHeight > 0 && imageSize && imageSize.height > 0 && imageSize.width > 0) {
      var factor = Math.max(imageSize.height/maxHeight, imageSize.width/maxWidth);
      return {
        height: imageSize.height / factor,
        width: imageSize.width / factor
      }
    }
    return imageSize;
}

export const clearMarksOnCanvas = (crc: CanvasRenderingContext2D, base64: string, afterDrawImage: (crc: CanvasRenderingContext2D) => void) => {
  if (crc) {    
    crc.save();

    // Use the identity matrix while clearing the canvas
    crc.setTransform(1, 0, 0, 1, 0, 0);
    crc.clearRect(0, 0, crc.canvas.width, crc.canvas.height);

    // Restore the transform
    crc.restore();

    if (base64 != null) {
      var image = new Image();
      image.onload = () => {
        drawImageOnCanvas(crc, image);
        afterDrawImage(crc);
      };
      image.src = base64;
    }
  }
}

export const drawMarksOnCanvas = (crc: CanvasRenderingContext2D, marks: ImageMarkPart[], imageOriginalSize: ImageSize) => {
  if (crc != undefined && marks.length > 0) {
    marks.forEach(m => {
      drawMarkOnCanvas(crc, m, imageOriginalSize);
    });
  }
}

export const drawMarkOnCanvas = (crc: CanvasRenderingContext2D, m: ImageMarkPart, imageOriginalSize: ImageSize): void => {
  crc.beginPath();
  var { x1, y1, x2, y2 } = calculateMarkWithFactorForDisplay(crc, m, imageOriginalSize);
  crc.moveTo(x1, y1); // from
  crc.lineTo(x2, y2);
  crc.stroke();
}

export const calculateMarkWithFactorForDisplay = (crc: CanvasRenderingContext2D, m: ImageMarkPart, imageSize: ImageSize): ImageMarkPart => {
  var x1 = m.x1 / (imageSize.width / crc.canvas.width);
  var y1 = m.y1 / (imageSize.height / crc.canvas.height);
  var x2 = m.x2 / (imageSize.width / crc.canvas.width);
  var y2 = m.y2 / (imageSize.height / crc.canvas.height);
  return { x1, y1, x2, y2 };
}

export const calculateMarkWithFactorForSave = (crc: CanvasRenderingContext2D, m: ImageMarkPart, imageSize: ImageSize): ImageMarkPart => {
  var x1 = m.x1 * (imageSize.width / crc.canvas.width);
  var y1 = m.y1 * (imageSize.height / crc.canvas.height);
  var x2 = m.x2 * (imageSize.width / crc.canvas.width);
  var y2 = m.y2 * (imageSize.height / crc.canvas.height);
  return { x1, y1, x2, y2 };
}

export const calculateFactorForCanvas = (crc: CanvasRenderingContext2D): ImageSize => {
  return { 
    width: ((crc.canvas.clientWidth > 0) ? (crc.canvas.clientWidth / crc.canvas.width) : 1),
    height: ((crc.canvas.clientHeight > 0) ? (crc.canvas.clientHeight / crc.canvas.height) : 1)
  }
}

export const calculateMarkWithFactorForDisplayAfterDraw = (crc: CanvasRenderingContext2D, m: ImageMarkPart): ImageMarkPart => {
  var factor = calculateFactorForCanvas(crc);
  var x1 = m.x1 / factor.width;
  var y1 = m.y1 / factor.height;
  var x2 = m.x2 / factor.width;
  var y2 = m.y2 / factor.height;
  return { x1, y1, x2, y2 };
}

export const drawImageOnCanvas = (crc: CanvasRenderingContext2D, image: HTMLImageElement) => {
  var canvas = crc.canvas;
  var hRatio = canvas.width / image.width;
  var vRatio = canvas.height / image.height;
  var ratio = Math.min(hRatio, vRatio);
  var centerShift_x = (canvas.width - image.width * ratio) / 2;
  var centerShift_y = (canvas.height - image.height * ratio) / 2;

  crc.drawImage(image, 0, 0, image.width, image.height,
    centerShift_x, centerShift_y, image.width * ratio, image.height * ratio);
}

