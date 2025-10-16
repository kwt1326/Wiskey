import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Answer } from '../answer/answer.entity';
import { BaseEntity } from '../common/base.entity';
import { BountyStatus } from '../common/types';

@Entity('bounties')
export class Bounty extends BaseEntity {
  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'reward_eth', type: 'decimal', precision: 18, scale: 8 })
  rewardEth: string;

  @Column({ name: 'reward_tx_hash', nullable: true })
  rewardTxHash?: string; // 프론트에서 전달받은 예치 트랜잭션 해시

  @Column({ name: 'vault_bounty_id', nullable: true })
  vaultBountyId?: string; // 컨트랙트 상의 바운티 ID (distribute 시 필요)

  @Column({ name: 'views', default: 0 })
  views: number;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BountyStatus,
    default: BountyStatus.OPEN,
  })
  status: BountyStatus;

  @ManyToOne(() => User, (user) => user.bounties, { eager: true })
  creator: User;

  @OneToMany(() => Answer, (answer) => answer.bounty, { cascade: true })
  answers: Answer[];
}
