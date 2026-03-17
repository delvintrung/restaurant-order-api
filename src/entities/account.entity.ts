import { AccountRole } from 'src/common/enums/account-role.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('accounts')
export class AccountEntity extends BaseEntity {
  @Column({ name: 'restaurant_id', type: 'uuid', nullable: true })
  restaurantId?: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: AccountRole, default: AccountRole.MANAGER })
  role?: AccountRole;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  refreshToken?: string;
}
