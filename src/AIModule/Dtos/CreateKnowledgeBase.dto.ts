export class CreateKnowledgeBaseDto {
    knowledge_base_name: string

    constructor(knowledge_base_name: string) {
        this.knowledge_base_name = knowledge_base_name
    }
}

export class CreateKnowledgeBaseResponseDto {
    
  knowledge_base_id: string

  knowledge_base_name: string
}