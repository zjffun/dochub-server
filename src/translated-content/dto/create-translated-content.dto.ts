export class CreateTranslatedContentDto {
  readonly nameId: string;
  readonly fromPath: string;
  readonly toPath: string;
  readonly title: string;
  readonly content: string;
  readonly state: string;
}
