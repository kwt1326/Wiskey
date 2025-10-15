import { BaseEntity } from '../common/base.entity';
import { Bounty } from '../bounty/bounty.entity';
import { User } from '../user/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('answers')
export class Answer extends BaseEntity {
  @Column({ name: 'content', type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.answers, { eager: true })
  author: User;

  @ManyToOne(() => Bounty, (bounty) => bounty.answers, { onDelete: 'CASCADE' })
  bounty: Bounty;
}
