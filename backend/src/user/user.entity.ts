import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Bounty } from '../bounty/bounty.entity';
import { Answer } from '../answer/answer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  walletAddress: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: 0 })
  totalRewardsEarned: number;

  @Column({ default: 0 })
  totalBountiesPosted: number;

  @Column({ default: 0 })
  totalAnswersGiven: number;

  @Column({ default: 0 })
  totalWinningAnswers: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToMany(() => Bounty, (bounty) => bounty.poster)
  postedBounties: Bounty[];

  @OneToMany(() => Answer, (answer) => answer.responder)
  answers: Answer[];
}
