import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import * as bountyService_1 from './bounty.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { BountyStatus } from './bounty.entity';

@ApiTags('bounties')
@Controller('bounties')
export class BountyController {
  constructor(private readonly bountyService: bountyService_1.BountyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bounty' })
  @ApiHeader({
    name: 'x-wallet-address',
    description: 'Wallet address of the bounty creator',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Bounty created successfully' })
  @ApiResponse({ status: 401, description: 'Wallet address required' })
  create(
    @Body() createBountyDto: CreateBountyDto,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.bountyService.create(createBountyDto, walletAddress);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bounties with optional filtering and pagination' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort bounties by criteria' })
  @ApiQuery({ name: 'status', required: false, enum: BountyStatus, description: 'Filter by bounty status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'List of bounties retrieved successfully' })
  findAll(
    @Query('sortBy') sortBy?: bountyService_1.SortType,
    @Query('status') status?: BountyStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.bountyService.findAll(sortBy, status, pageNum, limitNum);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search bounties by query' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.bountyService.searchBounties(query, pageNum, limitNum);
  }

  @Get('my-bounties')
  @ApiOperation({ summary: 'Get bounties created by the authenticated user' })
  @ApiHeader({
    name: 'x-wallet-address',
    description: 'Wallet address of the user',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User bounties retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Wallet address required' })
  getMyBounties(@Headers('x-wallet-address') walletAddress: string) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.bountyService.findByUser(walletAddress);
  }

  @Get('my-answers')
  @ApiOperation({ summary: 'Get bounties answered by the authenticated user' })
  @ApiHeader({
    name: 'x-wallet-address',
    description: 'Wallet address of the user',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User answered bounties retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Wallet address required' })
  getMyAnswers(@Headers('x-wallet-address') walletAddress: string) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.bountyService.findAnsweredByUser(walletAddress);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific bounty by ID' })
  @ApiParam({ name: 'id', description: 'Bounty ID' })
  @ApiResponse({ status: 200, description: 'Bounty retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bounty not found' })
  findOne(@Param('id') id: string) {
    return this.bountyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bounty' })
  @ApiParam({ name: 'id', description: 'Bounty ID' })
  @ApiHeader({
    name: 'x-wallet-address',
    description: 'Wallet address of the bounty owner',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Bounty updated successfully' })
  @ApiResponse({ status: 401, description: 'Wallet address required' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this bounty' })
  @ApiResponse({ status: 404, description: 'Bounty not found' })
  update(
    @Param('id') id: string,
    @Body() updateBountyDto: UpdateBountyDto,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.bountyService.update(id, updateBountyDto, walletAddress);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bounty' })
  @ApiParam({ name: 'id', description: 'Bounty ID' })
  @ApiHeader({
    name: 'x-wallet-address',
    description: 'Wallet address of the bounty owner',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Bounty deleted successfully' })
  @ApiResponse({ status: 401, description: 'Wallet address required' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this bounty' })
  @ApiResponse({ status: 404, description: 'Bounty not found' })
  remove(
    @Param('id') id: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.bountyService.remove(id, walletAddress);
  }

  @Post(':id/select-winner')
  @ApiOperation({ summary: 'Select winner for a bounty' })
  @ApiParam({ name: 'id', description: 'Bounty ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        answerId: {
          type: 'string',
          description: 'ID of the winning answer',
        },
      },
      required: ['answerId'],
    },
  })
  @ApiHeader({
    name: 'x-wallet-address',
    description: 'Wallet address of the bounty owner',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Winner selected successfully' })
  @ApiResponse({ status: 401, description: 'Wallet address required' })
  @ApiResponse({ status: 403, description: 'Not authorized to select winner for this bounty' })
  @ApiResponse({ status: 404, description: 'Bounty or answer not found' })
  selectWinner(
    @Param('id') bountyId: string,
    @Body('answerId') answerId: string,
    @Headers('x-wallet-address') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address required');
    }
    return this.bountyService.selectWinner(bountyId, answerId, walletAddress);
  }
}
