import { HttpException } from '@nestjs/common';
import { UpdateRelationDto } from 'src/relations/dto/update-relation.dto';
import { CreateDocDto } from './create-doc.dto';

const fields = [
  'fromOwner',
  'fromRepo',
  'fromBranch',
  'fromPath',
  'fromOriginalRev',
  'fromModifiedRev',
  'fromOriginalContentSha',
  'fromModifiedContentSha',
  'toOwner',
  'toRepo',
  'toBranch',
  'toPath',
  'toOriginalRev',
  'toModifiedRev',
  'toOriginalContentSha',
  'toModifiedContentSha',
];

export class UpdateDocDto extends CreateDocDto {
  readonly newPath?: string;
  readonly relations?: UpdateRelationDto[];

  static setUpdateData(doc: any, updateDocDto: UpdateDocDto) {
    if (updateDocDto.pullNumber !== undefined) {
      if (typeof updateDocDto.pullNumber !== 'number') {
        throw new HttpException('pullNumber must be a number', 400);
      }

      doc.pullNumber = updateDocDto.pullNumber;
    }

    for (const field of fields) {
      if (updateDocDto[field] !== undefined) {
        doc[field] = updateDocDto[field];
      }
    }
  }
}
