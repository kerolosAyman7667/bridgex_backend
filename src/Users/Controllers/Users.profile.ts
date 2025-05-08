import { createMap, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Injectable, Scope, Type } from '@nestjs/common';
import { Users } from '../Models/Users.entity';
import { UserReturnDto } from '../Dtos/UserReturn.dto';
import { MapEnumHelper } from 'src/Common/MapEnum.helper';
import { Usertypes } from '../Models/Usertype';
import { UserCreateDto } from '../Dtos/UserCreate.dto';
import { UserUpdateDto } from '../Dtos/UserUpdate.dto';
import { UserPreviewDto, UserPreviewWithEmailDto, UserPreviewWithIdDto } from '../Dtos/UserPreview.dto';

@Injectable()
export class UsersProfile extends AutomapperProfile {

  constructor(
    @InjectMapper()
    mapper: Mapper
  ) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap(mapper, Users, UserCreateDto);
      createMap(mapper, UserCreateDto, Users);
      createMap(mapper, UserUpdateDto, Users);
      createMap(mapper,Users,UserReturnDto,MapEnumHelper.Map(Usertypes,"Usertype")),
      createMap(mapper, Users, UserPreviewDto);
      createMap(mapper, Users, UserPreviewWithEmailDto);
      createMap(mapper, Users, UserPreviewWithIdDto);
    };
  }

}

