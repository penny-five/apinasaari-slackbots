import { Canvas, Image } from 'canvas';
import canvasTxt from 'canvas-txt';

export class MemePainter {
  private canvas: Canvas;

  private static readonly PADDING_PIXELS = 10;

  private static readonly MAX_FONT_SIZE_PIXELS = 100;

  private static readonly MIN_FONT_SIZE_PIXELS = 30;

  private static readonly OUT_MIME_TYPE = 'image/jpeg';

  constructor(private width: number, private height: number) {
    this.canvas = new Canvas(width, height);
  }

  drawTemplate(template: string | Buffer) {
    const image = new Image();
    image.src = template;
    image.width = this.width;
    image.height = this.height;

    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
  }

  drawText(text: string, top: number, right: number, bottom: number, left: number) {
    const ctx = this.canvas.getContext('2d');

    const fontSize = this.measureFontSize(
      text,
      right - left - 2 * MemePainter.PADDING_PIXELS,
      bottom - top - 2 * MemePainter.PADDING_PIXELS
    );

    canvasTxt.fontSize = fontSize;
    canvasTxt.font = 'serif';

    canvasTxt.drawText(
      ctx,
      text,
      left + MemePainter.PADDING_PIXELS,
      top + MemePainter.PADDING_PIXELS,
      right - left - 2 * MemePainter.PADDING_PIXELS,
      bottom - top - 2 * MemePainter.PADDING_PIXELS
    );
  }

  private measureFontSize(text: string, maxWidth: number, maxHeight: number) {
    const testCanvas = new Canvas(maxWidth, maxHeight);

    let fontSize = MemePainter.MAX_FONT_SIZE_PIXELS;

    while (fontSize > MemePainter.MIN_FONT_SIZE_PIXELS) {
      canvasTxt.fontSize = fontSize;
      canvasTxt.font = 'serif';

      const { height } = canvasTxt.drawText(testCanvas.getContext('2d'), text, 0, 0, maxWidth, maxHeight);

      if (height < maxHeight) {
        break;
      }

      fontSize = fontSize - 10;
    }

    return fontSize;
  }

  toBuffer() {
    return {
      buffer: this.canvas.toBuffer(MemePainter.OUT_MIME_TYPE, { quality: 0.8 }),
      mimeType: MemePainter.OUT_MIME_TYPE
    };
  }
}
