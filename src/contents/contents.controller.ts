import { Controller } from '@nestjs/common';
import { apiPrefix } from 'src/config';
import { ContentsService } from './contents.service';

@Controller(apiPrefix)
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}
}
