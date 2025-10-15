import { Entity, ManyToOne, Column } from 'typeorm';
import { Answer } from '../answer/answer.entity';
import { Bounty } from '../bounty/bounty.entity';
import { BaseEntity } from '../common/base.entity';

@Entity('bounty_winners')
export class BountyWinner extends BaseEntity {
  @ManyToOne(() => Bounty, { eager: true, onDelete: 'CASCADE' })
  bounty: Bounty;

  @ManyToOne(() => Answer, { eager: true, onDelete: 'CASCADE' })
  answer: Answer;

  @Column({ name: 'reward_paid', type: 'boolean', default: false })
  rewardPaid: boolean;

  @Column({ name: 'tx_hash', type: 'varchar', nullable: true })
  txHash?: string;
}
