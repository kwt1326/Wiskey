import { IsString, IsOptional, IsEthereumAddress } from 'class-validator';

export class CreateUserDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
