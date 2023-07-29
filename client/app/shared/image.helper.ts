import { ImageMarkPart, ImageSize } from "../core/models"

export const calculateCanvasSize = (maxWidth: number, maxHeight: number, imageSize: ImageSize): ImageSize => {

    if (maxWidth > 0 && maxHeight > 0 && imageSize && imageSize.height > 0 && imageSize.width > 0) {
        if (imageSize.width > imageSize.height) {
            return {
            height: imageSize.height * (maxWidth / imageSize.width),
            width: maxWidth
            }
        } else {
            return {
            height: maxHeight,
            width: imageSize.width * (maxHeight / imageSize.height)
            }
        }
    }
    return imageSize;
}

export const drawMarksOnCanvas = (crc: CanvasRenderingContext2D, marks: ImageMarkPart[], factor: number) => {
  if (crc != undefined && marks.length > 0 && factor > 0) {
    

    marks.forEach(m => {
      drawMarkOnCanvas(crc, m);
    });
  }
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
        crc.drawImage(image, 0, 0);
        afterDrawImage(crc);
      };
      image.src = base64;
    }
  }
}

export const drawMarkOnCanvas = (crc: CanvasRenderingContext2D, m: ImageMarkPart): void => {
  crc.beginPath();
  var { x1, y1, x2, y2 } = calculateMarkWithFactor(m, crc);
  crc.moveTo(x1, y1); // from
  crc.lineTo(x2, y2);
  crc.stroke();
}
export const calculateMarkWithFactor = (m: ImageMarkPart, crc: CanvasRenderingContext2D): ImageMarkPart => {
  var x1 = m.x1 / ((crc.canvas.clientWidth > 0) ? (crc.canvas.clientWidth / crc.canvas.width) : 1);
  var y1 = m.y1 / ((crc.canvas.clientHeight > 0) ? (crc.canvas.clientHeight / crc.canvas.height) : 1);
  var x2 = m.x2 / ((crc.canvas.clientWidth > 0) ? (crc.canvas.clientWidth / crc.canvas.width) : 1);
  var y2 = m.y2 / ((crc.canvas.clientHeight > 0) ? (crc.canvas.clientHeight / crc.canvas.height) : 1);
  return { x1, y1, x2, y2 };
}

