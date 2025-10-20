import { BaseEntity } from '../common/base.entity';
import { Bounty } from '../bounty/bounty.entity';
import { User } from '../user/user.entity';
import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import { AnswerStatus } from '../common/types';

@Entity('answers')
@Unique(['author', 'bounty'])
export class Answer extends BaseEntity {
  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AnswerStatus,
    default: AnswerStatus.PENDING,
  })
  status: AnswerStatus;

  @ManyToOne(() => User, (user) => user.answers, { eager: true })
  author: User;

  @ManyToOne(() => Bounty, (bounty) => bounty.answers, { onDelete: 'CASCADE' })
  bounty: Bounty;
}
