import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('answers')
@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  create(
    @Body() createAnswerDto: CreateAnswerDto,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.answerService.create(createAnswerDto, walletAddress);
  }

  @Get()
  findAll() {
    return this.answerService.findAll();
  }

  @Get('bounty/:bountyId')
  findByBounty(@Param('bountyId') bountyId: string) {
    const bounty = this.findByBounty(bountyId);
    return this.answerService.findByBounty(bounty);
  }

  @Get('my-answers')
  getMyAnswers(@Headers('x-wallet-address') walletAddress: string) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.answerService.findByUser(walletAddress);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('content') content: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.answerService.update(id, content, walletAddress);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.answerService.remove(id, walletAddress);
  }

  @Post(':id/upvote')
  upvote(
    @Param('id') id: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.answerService.upvote(id, walletAddress);
  }

  @Post(':id/downvote')
  downvote(
    @Param('id') id: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.answerService.downvote(id, walletAddress);
  }
}
