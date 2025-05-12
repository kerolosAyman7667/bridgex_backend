import { createMap, forMember, mapFrom, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Injectable, } from '@nestjs/common';
import { LogoDto } from '../../Common/DTOs/Logo.dto';
import { Communities } from '../Models/Communities.entity';
import { CommunityCardDto } from '../Dtos/CommunityCard.dto';
import { CommunitiesImages } from '../Models/CommunitiesImages.entity';
import { CommunityDto } from '../Dtos/Community.dto';
import { CommunitiesMedia } from '../Models/CommunitiesMedia.entity';
import { ImagesDto } from 'src/Common/DTOs/Images.dto';
import { MediaCreateDto } from 'src/Common/DTOs/MediaCreatedto';
import { CommunityBasicDto } from '../Dtos/CommunityBasic.dto';

@Injectable()
export class CommunitiesProfile extends AutomapperProfile {

  constructor(
    @InjectMapper()
    mapper: Mapper
  ) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap(mapper,Communities,LogoDto),
      createMap(mapper,Communities,CommunityBasicDto),
      createMap(mapper,Communities,CommunityCardDto),
      createMap(mapper,CommunitiesImages,ImagesDto, forMember(
            (destination:ImagesDto) => destination.Link,
            mapFrom((source : CommunitiesImages) => source.File)
        )
      ),
      createMap(mapper,Communities,CommunityDto),
      createMap(mapper,MediaCreateDto,CommunitiesMedia),
      createMap(mapper,CommunitiesMedia,MediaCreateDto)

    };
  }

}

