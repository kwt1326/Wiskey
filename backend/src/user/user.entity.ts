import { Entity, Column, OneToMany } from 'typeorm';
import { Bounty } from '../bounty/bounty.entity';
import { Answer } from '../answer/answer.entity';
import { BaseEntity } from '../common/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'wallet_address', unique: true, collation: 'C' })
  walletAddress: string;

  @OneToMany(() => Bounty, (bounty) => bounty.creator)
  bounties: Bounty[];

  @OneToMany(() => Answer, (answer) => answer.author)
  answers: Answer[];
}
