import { HttpException } from '@nestjs/common';
import { IDocDto } from '../dto/doc.dto';

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

export default function setUpdateData(doc: any, updateDocDto: IDocDto) {
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
