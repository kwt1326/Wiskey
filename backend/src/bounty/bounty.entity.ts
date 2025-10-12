import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Answer } from '../answer/answer.entity';

export enum BountyStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('bounties')
export class Bounty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 18, scale: 8 })
  reward: number;

  @Column({
    type: 'enum',
    enum: BountyStatus,
    default: BountyStatus.OPEN,
  })
  status: BountyStatus;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.postedBounties)
  @JoinColumn({ name: 'posterId' })
  poster: User;

  @OneToMany(() => Answer, (answer) => answer.bounty)
  answers: Answer[];

  @ManyToOne(() => Answer, { nullable: true })
  @JoinColumn({ name: 'winningAnswerId' })
  winningAnswer?: Answer;
}
