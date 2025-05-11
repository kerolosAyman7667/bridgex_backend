import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobe from '@ffprobe-installer/ffprobe';
import * as fs from 'fs';
import * as util from 'util';
import { join } from 'path';

const probeAsync = util.promisify(ffmpeg.ffprobe);

@Injectable()
export class VideoTranscodingService {
    constructor() {
        ffmpeg.setFfprobePath(ffprobe.path);
    }

    // Main public method
    async transcodeToSupportedFormat(
        inputPath: string,
        outputPath: string
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                inputPath = join(__dirname,"..","..","..","files",inputPath)
                outputPath = join(__dirname,"..","..","..","files",outputPath)
                // First validate input is processable
                await this.validateInput(inputPath);

                // Perform transcoding
                await this.runTranscoding(inputPath, outputPath);

                // Verify output
                await this.validateOutput(outputPath);

                resolve();
            } catch (err) {
                // Clean up failed transcodes
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
                reject(err);
            }
        });
    }

    // Private helper methods
    private async validateInput(inputPath: string): Promise<void> {
        try {
            await this.getVideoMetadata(inputPath);
        } catch (err:any) {
            throw new Error(`Invalid input file: ${err.message}`);
        }
    }

    private async runTranscoding(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-pix_fmt yuv420p',
                    '-movflags faststart'
                ])
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });
    }

    private async validateOutput(outputPath: string): Promise<void> {
        const metadata = await this.getVideoMetadata(outputPath);
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        if (!videoStream || videoStream.codec_name !== 'h264') {
            throw new Error('Output video codec validation failed');
        }

        if (audioStream && audioStream.codec_name !== 'aac') {
            throw new Error('Output audio codec validation failed');
        }

        if (videoStream.pix_fmt !== 'yuv420p') {
            throw new Error('Output pixel format validation failed');
        }
    }

    // The missing getVideoMetadata implementation
    private async getVideoMetadata(filePath: string): Promise<any> {
        return probeAsync(filePath);
    }
}