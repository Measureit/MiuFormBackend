import { ImageSize } from "../core/models"

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