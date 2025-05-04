import { Injectable, InternalServerErrorException, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateKnowledgeBaseDto, CreateKnowledgeBaseResponseDto } from "./Dtos/CreateKnowledgeBase.dto";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { createReadStream } from "fs";
import { CreateAssetResponseDto } from "./Dtos/CreateAssetResponse.dto";
import { join } from "path";

@Injectable({ scope: Scope.REQUEST })
export class AIUrlService {


    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {

    }

    async AddKnowledgeBase(dto: CreateKnowledgeBaseDto): Promise<CreateKnowledgeBaseResponseDto> {
        let responseData: CreateKnowledgeBaseResponseDto;
        try {
            const response = await lastValueFrom(
                this.httpService.post<CreateKnowledgeBaseResponseDto>(
                    `${this.configService.getOrThrow<string>("AIBASEURL")}/knowledge_bases`,
                    dto)
            );

            responseData = response.data;
            if (!responseData.knowledge_base_id) {
                console.log("knowledge_base_id is not provided", dto);
                throw new InternalServerErrorException("Error has happened try again later")
            }
        } catch (ex) {
            console.log(ex);
            throw new InternalServerErrorException("Error has happened try again later")
        }
        return responseData;
    }

    async DeleteKnowledgeBase(knowledgeBaseId: string, raiseErrorIfFailed: boolean = true): Promise<void> {
        try {
            await lastValueFrom(
                this.httpService.delete(`${this.configService.getOrThrow<string>("AIBASEURL")}/knowledge_bases/${knowledgeBaseId}`)
            );
        } catch (ex) {
            console.log(ex)
            // if (raiseErrorIfFailed)
            //     throw new InternalServerErrorException("Error has happened try again later")
        }
    }


    async AddAsset(knowledgeBaseId: string, filePath: string): Promise<CreateAssetResponseDto> {
        const FormData = require('form-data');

        const form = new FormData();
        form.append('file', createReadStream(join(__dirname, "..", "..", "files", filePath)));

        try {
            const response = await lastValueFrom(
                this.httpService.post<CreateAssetResponseDto>(`${this.configService.getOrThrow<string>("AIBASEURL")}/assets/${knowledgeBaseId}`,
                    form, {
                    headers: form.getHeaders(),
                }),
            );

            lastValueFrom(
                this.httpService.post(
                    `${this.configService.getOrThrow<string>("AIBASEURL")}/assets/process/${knowledgeBaseId}/asset/${response.data.asset_id}`,
                    {
                        "chunk_size": 500,
                        "do_reset": false,
                        "overlap_size": 50,
                        "reset_vector_db": false,
                        "skip_duplicates": true
                    }
                ),
            ).then(() => {
                try
                {
                    this.httpService.post(
                        `${this.configService.getOrThrow<string>("AIBASEURL")}/nlp/knowledge-bases/${knowledgeBaseId}/asset/${response.data.asset_id}/index`,
                        {
                            "do_reset": false,
                            "skip_duplicates": true
                        }
                    ).subscribe();
                }catch(err){console.log(err)}
            }).catch(ex=>{console.log(ex)});

            return response.data
        } catch (ex) {
            console.log(ex);
            throw new InternalServerErrorException("Error has happened try again later")
        }
    }

    async DeleteAsset(knowledgeBaseId: string, assetId: string, raiseErrorIfFailed: boolean = true) {
        try {
            await lastValueFrom(
                this.httpService.delete(`${this.configService.getOrThrow<string>("AIBASEURL")}/assets/${knowledgeBaseId}/asset/${assetId}`)
            );
        } catch (ex) {
            console.log(ex)
            // if (raiseErrorIfFailed)
            //     throw new InternalServerErrorException("Error has happened try again later")
        }
    }

}