import { Controller } from '@nestjs/common';
import { ContentsService } from './contents.service';

@Controller('api/translated-content')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}
}
