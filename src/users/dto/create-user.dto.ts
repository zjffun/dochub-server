export class CreateUserDto {
  readonly login?: string;
  readonly password?: string;
  readonly role?: string;
  readonly name?: string;
  readonly avatarUrl?: string;
  readonly email?: string;
  readonly githubId?: string;
}
