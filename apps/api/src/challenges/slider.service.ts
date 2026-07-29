import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { readdirSync } from 'fs';
import { join } from 'path';
import { CaptchaType } from '@ruwhoman/shared';

export interface SliderResult {
    background: Buffer;
    piece: Buffer;
    pieceWidth: number;
    imageWidth: number;
    imageHeight: number;
}

interface SliderCaptcha {
    type: typeof CaptchaType.SLIDER;
    question: string;
    answer: string;
}

const PIECE_WIDTH = 50;
const DISPLAY_WIDTH = 400;

export const SLIDER_TOLERANCE = 4; // needed as otherwise it must be a pixel perfect match on the slider

@Injectable()
export class SliderService {
    private readonly imagesDir = join(__dirname, 'slider-images');

    generate(): SliderCaptcha {
        const filenames = readdirSync(this.imagesDir).filter((f) => f.endsWith('.jpg'));
        const filename = filenames[Math.floor(Math.random() * filenames.length)];
        const maxX = DISPLAY_WIDTH - PIECE_WIDTH;
        const targetX = Math.floor(Math.random() * (maxX + 1));

        return {
            type: CaptchaType.SLIDER,
            question: filename,
            answer: String(targetX),
        };
    }

    async render(filename: string, targetX: number): Promise<SliderResult> {
        const filePath = join(this.imagesDir, filename);
        const metadata = await sharp(filePath).metadata();

        const imageHeight = Math.round(metadata.height * (DISPLAY_WIDTH / metadata.width));
        const imageWidth = DISPLAY_WIDTH;

        const [background, piece] = await Promise.all([
            sharp(filePath)
                .resize({ width: DISPLAY_WIDTH })
                .composite([{
                    input: {
                        create: {
                            width: PIECE_WIDTH,
                            height: imageHeight,
                            channels: 4,
                            background: { r: 200, g: 200, b: 200, alpha: 1 },
                        },
                    },
                    top: 0,
                    left: targetX,
                }])
                .jpeg({ quality: 70 })
                .toBuffer(),

            sharp(filePath)
                .resize({ width: DISPLAY_WIDTH })
                .extract({ left: targetX, top: 0, width: PIECE_WIDTH, height: imageHeight })
                .jpeg({ quality: 70 })
                .toBuffer(),
        ]);

        return {
            background,
            piece,
            pieceWidth: PIECE_WIDTH,
            imageWidth,
            imageHeight,
        };
    }
}
