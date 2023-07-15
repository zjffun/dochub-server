import { Controller } from '@nestjs/common';
import { apiPrefix } from 'src/config';
import { DocTreeService } from './docTree.service';

@Controller(apiPrefix)
export class DocTreeController {
  constructor(private readonly docTreeService: DocTreeService) {}
}
