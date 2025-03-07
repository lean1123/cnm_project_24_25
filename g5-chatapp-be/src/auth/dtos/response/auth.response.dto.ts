export class AuthResponseDto {
  token: string;
  user: { id: string; email: string };
}
