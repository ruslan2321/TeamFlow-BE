import { IsNumber } from "class-validator";

export class AddToTeamDto {
  @IsNumber()
  memberId: number;
}
