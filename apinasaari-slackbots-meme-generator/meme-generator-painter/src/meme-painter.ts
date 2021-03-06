import { Canvas, Image, CanvasRenderingContext2D, createCanvas, registerFont } from 'canvas';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import sum from 'lodash/sum';

import fontRegular from '../fonts/Lato-Regular.ttf';
import fontBold from '../fonts/Lato-Bold.ttf';

const CUSTOM_FONT_FAMILY = 'Lato';

registerFont(fontRegular, {
  family: CUSTOM_FONT_FAMILY,
  weight: 'regular'
});

registerFont(fontBold, {
  family: CUSTOM_FONT_FAMILY,
  weight: 'bold'
});

interface TextToken {
  text: string;
  measuredWidth: number;
}

interface TextOptions {
  textColor?: string;
  strokeColor?: string;
  textAlign?: 'left' | 'center';
  fontWeight?: 'regular' | 'bold';
  fontSize?: number;
}

export class MemePainter {
  private static readonly MAX_FONT_SIZE = 100;

  private static readonly PADDING_PIXELS = 30;

  private static readonly DEFAULT_TEXT_COLOR = '#000000';

  private static readonly DEFAULT_FONT_WEIGHT = 'regular';

  private static readonly OUT_MIME_TYPE = 'image/jpeg';

  private static readonly DEBUG = false;

  private static readonly DEBUG_COLOR_1 = '#FF0000';

  private static readonly DEBUG_COLOR_2 = '#0000FF';

  private canvas: Canvas;

  private context: CanvasRenderingContext2D;

  constructor(private width: number, private height: number) {
    this.canvas = createCanvas(width, height);
    this.context = this.canvas.getContext('2d')!;
    this.setupContext(this.context);
  }

  drawTemplate(template: string | Buffer) {
    const image = new Image();
    image.src = template;
    image.width = this.width;
    image.height = this.height;

    this.context.drawImage(image, 0, 0, image.width, image.height);
  }

  drawText(text: string, top: number, right: number, bottom: number, left: number, options?: TextOptions) {
    if (MemePainter.DEBUG) {
      this.context.strokeStyle = MemePainter.DEBUG_COLOR_1;
      this.context.strokeRect(left, top, right - left, bottom - top);

      this.context.strokeStyle = MemePainter.DEBUG_COLOR_2;
      this.context.strokeRect(
        left + MemePainter.PADDING_PIXELS,
        top + MemePainter.PADDING_PIXELS,
        right - left - 2 * MemePainter.PADDING_PIXELS,
        bottom - top - 2 * MemePainter.PADDING_PIXELS
      );
    }

    const sanitizedText = this.sanitize(text);

    let fontSize = MemePainter.MAX_FONT_SIZE;

    const maxWidth = right - left - 2 * MemePainter.PADDING_PIXELS;
    const maxHeight = bottom - top - 2 * MemePainter.PADDING_PIXELS;

    do {
      const fits = this.fitText(sanitizedText, maxWidth, maxHeight, {
        fontSize,
        fontWeight: options?.fontWeight
      });

      if (fits) {
        break;
      }

      fontSize = fontSize - 1;
    } while (fontSize > 1);

    this.setupContext(this.context, { fontSize, fontWeight: options?.fontWeight });

    const tokens = this.tokenize(this.context, sanitizedText);
    const lines = this.wordwrap(tokens, maxWidth);

    const lineHeight = this.computeLineHeight(fontSize);

    let y = bottom + 0.5 * (top - bottom) - 0.5 * (lines.length * lineHeight);

    for (const line of lines) {
      let x: number;

      if (options?.textAlign === 'center') {
        x = left + 0.5 * (right - left) - 0.5 * sum(line.map(token => token.measuredWidth));
      } else {
        x = left + MemePainter.PADDING_PIXELS;
      }

      for (const token of line) {
        if (MemePainter.DEBUG) {
          this.context.strokeStyle = MemePainter.DEBUG_COLOR_1;
          this.context.strokeRect(x, y, token.measuredWidth, lineHeight);
        }

        this.context.fillStyle = options?.textColor || MemePainter.DEFAULT_TEXT_COLOR;
        this.context.fillText(token.text, x, y + lineHeight);

        if (options?.strokeColor) {
          this.context.strokeStyle = options.strokeColor;
          this.context.lineWidth = this.computeStrokeWidth(fontSize);
          this.context.strokeText(token.text, x, y + lineHeight);
        }

        x = x + token.measuredWidth;
      }
      y = y + lineHeight;
    }
  }

  /**
   * Tries to fit text into given horizontal and vertical estate.
   *
   * @param text Input text
   * @param fontSize Font size in pixels
   * @param maxWidth Available width in pixels
   * @param maxHeight Available height in pixels
   * @returns `true` if the text fits into available estate, `false` otherwise
   */
  private fitText(text: string, maxWidth: number, maxHeight: number, textOptions: TextOptions) {
    const canvas = createCanvas(maxWidth, maxHeight);
    const ctx = canvas.getContext('2d')!;
    this.setupContext(ctx, textOptions);

    const tokens = this.tokenize(ctx, this.sanitize(text));

    if (Math.max(...tokens.map(token => token.measuredWidth)) > maxWidth) {
      return false;
    }

    const lineHeight = this.computeLineHeight(textOptions.fontSize);

    return this.wordwrap(tokens, maxWidth).length * lineHeight <= maxHeight;
  }

  private sanitize(input: string) {
    return (
      input
        /**
         * Remove leading and trailing white space
         */
        .trim()
        .split('')
        /**
         * Remove excessive whitespace from middle of the input
         */
        .reduce((acc, current) => {
          if (this.isWhitespace(current) && this.isWhitespace(last(acc))) {
            return acc;
          }
          return [...acc, current];
        }, [] as string[])
        .join('')
    );
  }

  /**
   * Turns input text into tokens where each token is a word or a white space character.
   *
   * @param ctx  Rendering context
   * @param input Text input
   */
  private tokenize(ctx: CanvasRenderingContext2D, input: string): TextToken[] {
    let index = 0;
    return input
      .split('')
      .reduce((acc, current) => {
        if (this.isWhitespace(current)) {
          acc[index + 1] = current;
          index = index + 2;
        } else if (acc[index]) {
          acc[index] = acc[index] + current;
        } else {
          acc[index] = current;
        }
        return acc;
      }, [] as string[])
      .map(text => {
        const metrics = ctx.measureText(text);

        return {
          text,
          measuredWidth: Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight)
        };
      });
  }

  /**
   * Wraps tokens into lines.
   *
   * @param tokens Tokens
   * @param maxWidth Available width per line in pixels
   * @returns Tokens split into lines
   */
  private wordwrap(tokens: TextToken[], maxWidth: number) {
    const lines: TextToken[][] = [];

    for (const token of tokens) {
      if (isEmpty(lines)) {
        lines.push([token]);
      } else if (sum(last(lines).map(token => token.measuredWidth)) + token.measuredWidth <= maxWidth) {
        last(lines).push(token);
      } else if (this.isWhitespace(token.text)) {
        lines.push([]);
      } else {
        lines.push([token]);
      }
    }

    return lines;
  }

  private isWhitespace(text: string) {
    return text === ' ';
  }

  private computeLineHeight(fontSize: number) {
    return fontSize * 1.5;
  }

  private computeStrokeWidth(fontSize: number) {
    return fontSize > 50 ? 2 : 1;
  }

  private setupContext(context: CanvasRenderingContext2D, options?: TextOptions) {
    const fontWeight = options?.fontWeight || MemePainter.DEFAULT_FONT_WEIGHT;
    const fontSize = options?.fontSize || MemePainter.MAX_FONT_SIZE;
    context.font = `${fontWeight} ${fontSize}px ${CUSTOM_FONT_FAMILY}`;
    context.textBaseline = 'bottom';
  }

  toBuffer() {
    return {
      buffer: this.canvas.toBuffer(MemePainter.OUT_MIME_TYPE, { quality: 0.9 }),
      mimeType: MemePainter.OUT_MIME_TYPE
    };
  }
}
