import { CreateRelationDto } from 'src/relations/dto/create-relation.dto';

export class UpdateCollectionDto extends CreateRelationDto {
  readonly newPath: string;
}
