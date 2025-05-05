import { Provider } from "@nestjs/common";
import { CreateAssetResponseDto } from "./Dtos/CreateAssetResponse.dto";
import { CreateKnowledgeBaseDto, CreateKnowledgeBaseResponseDto } from "./Dtos/CreateKnowledgeBase.dto";
import { AIUrlService } from "./AIUrl.service";
import { ChatResponseDto } from "./Dtos/ChatResponse.dto";


export interface IAIUrlService {

    /**
     * 
     * @param dto 
     */
    AddKnowledgeBase(dto: CreateKnowledgeBaseDto): Promise<CreateKnowledgeBaseResponseDto>;

    /**
     * 
     * @param knowledgeBaseId 
     * @param raiseErrorIfFailed 
     */
    DeleteKnowledgeBase(knowledgeBaseId: string, raiseErrorIfFailed?: boolean): Promise<void>;

    /**
     * 
     * @param knowledgeBaseId 
     * @param fileBuffer 
     */
    AddAsset(knowledgeBaseId: string, fileBuffer:Buffer,fileName:string): Promise<CreateAssetResponseDto> 
    /**
     * 
     * @param knowledgeBaseId 
     * @param filePath 
     */
    AddAsset(knowledgeBaseId: string, filePath: string): Promise<CreateAssetResponseDto>

    /**
     * 
     * @param knowledgeBaseId 
     * @param assetId 
     * @param raiseErrorIfFailed 
     */
    DeleteAsset(knowledgeBaseId: string, assetId: string, raiseErrorIfFailed?: boolean) : Promise<void>;

    Chat(knowledgeBaseId: string,query:string): Promise<ChatResponseDto>;
}

export const IAIUrlService = Symbol("IAIUrlService");

export const IAIUrlServiceProvider:Provider = {
    provide:IAIUrlService,
    useClass:AIUrlService
}