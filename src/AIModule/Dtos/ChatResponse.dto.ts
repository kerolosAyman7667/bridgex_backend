import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SendChat } from './SendChat.dto';

export class ChatResponseDto {
  @AutoMap()
  @Expose()
  @ApiProperty()
  response: string

  @AutoMap(() => DocumentDto)
  @ApiProperty()
  @Expose()
  @Type(() => DocumentDto)
  sources: DocumentDto[] = []
}

export class Metadata {
  @AutoMap()
  @ApiProperty({ default: null })
  @Expose()
  page_num: number | null = null;

  @AutoMap()
  @ApiProperty({ default: null })
  @Expose()
  source_path: string | null = null;

  @AutoMap()
  @ApiProperty({ default: null })
  @Expose()
  document_name: string | null = null;

  @AutoMap()
  @ApiProperty({ default: null })
  @Expose()
  content_type: string | null = null;
}

export class DocumentDto {
  @AutoMap()
  @ApiProperty({ default: null })
  @Expose()
  doc_num: string | null = null;

  @AutoMap()
  @ApiProperty({ default: null })
  @Expose()
  score: number | null = null;

  @AutoMap()
  @ApiProperty({ default: null })
  @Expose()
  text: string | null = null;

  @AutoMap(() => Metadata)
  @ApiProperty({ type: Metadata, default: null })
  @Type(() => Metadata)
  @Expose()
  metadata: Metadata | null = null;
}

export class ChatResponseWithMessageDto extends SendChat {
  @ApiProperty({ type: ChatResponseDto })
  Response: ChatResponseDto

  constructor(response:ChatResponseDto,message:string) 
  {
    super()
    this.Message = message;
    this.Response = response;
  }
}