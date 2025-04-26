import { createMap, forMember, mapFrom, MappingProfile, mapWith } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Injectable, } from '@nestjs/common';
import { SubTeams } from '../Models/SubTeams.entity';
import { SubTeamCardDto } from '../Dtos/SubTeamCard.dto';
import { SubTeamImages } from '../Models/SubTeamImages.entity';
import { SubTeamDto } from '../Dtos/SubTeam.dto';
import { ImagesDto } from 'src/Common/DTOs/Images.dto';
import { SubTeamsMedia } from '../Models/SubTeamsMedia.entity';
import { MediaCreateDto } from 'src/Common/DTOs/MediaCreatedto';
import { SubTeamMembers } from '../Models/SubTeamMembers.entity';
import { MemberReturnDto } from '../Dtos/SubTeamMembersDtos/MemberReturn.dto';
import { LearningPhaseReturnDto } from '../Dtos/LearningPhase/LearningPhaseReturn.dto';
import { LearningPhaseSections } from '../Models/LearningPhase/LearningPhaseSections.entity';
import { LearningPhaseSectionDto } from '../Dtos/LearningPhase/LearningPhaseSection.dto';
import { LearningPhaseResources } from '../Models/LearningPhase/LearningPhaseResources.entity';
import { LearningPhaseVideos } from '../Models/LearningPhase/LearningPhaseVideos.entity';
import { LearningPhaseVideoDto } from '../Dtos/LearningPhase/LearningPhaseVideo.dto';
import { LearningPhaseResourceDto } from '../Dtos/LearningPhase/LearningPhaseResourceDto.dto';

@Injectable()
export class SubTeamsProfile extends AutomapperProfile {

  constructor(
    @InjectMapper()
    mapper: Mapper
  ) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap(mapper, SubTeams, SubTeamCardDto),
        createMap(mapper, SubTeamImages, ImagesDto, forMember(
          (destination: ImagesDto) => destination.Link,
          mapFrom((source: SubTeamImages) => source.File)
        )
        ),
        createMap(mapper, SubTeams, SubTeamDto, forMember(
          (destination: SubTeamDto) => destination.Leaders,
          mapWith(MemberReturnDto, SubTeamMembers, src => src.Members)
        )
        ),
        createMap(mapper, SubTeamsMedia, MediaCreateDto);
      createMap(mapper, SubTeamMembers, MemberReturnDto);
      createMap(mapper, LearningPhaseResources, LearningPhaseResourceDto);
      createMap(mapper, LearningPhaseVideos, LearningPhaseVideoDto, forMember(
        (destination: LearningPhaseVideoDto) => destination.IsCompleted,
        mapFrom((source: LearningPhaseVideos) => source?.Progress?.length > 0 ? source.Progress[0].IsCompleted : false)
      ), forMember(
        (destination: LearningPhaseVideoDto) => destination.WatchedDuration,
        mapFrom((source: LearningPhaseVideos) => source?.Progress?.length > 0 ? source.Progress[0].WatchDuration : 0)
      ));

      createMap(mapper, SubTeams, LearningPhaseReturnDto, forMember(
        (destination: LearningPhaseReturnDto) => destination.Sections,
        mapWith(LearningPhaseSectionDto, LearningPhaseSections, src => src.LearningPhaseSections)
      ),
        forMember(
          (destination: LearningPhaseReturnDto) => destination.TiTle,
          mapFrom((source: SubTeams) => source.LearningPhaseTitle)
        ),
        forMember(
          (destination: LearningPhaseReturnDto) => destination.Desc,
          mapFrom((source: SubTeams) => source.LearningPhaseDesc)
        )
      );
      createMap(mapper, LearningPhaseSections, LearningPhaseSectionDto);
    };
  }

}

