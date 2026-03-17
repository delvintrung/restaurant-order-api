import { CustomRepository } from 'src/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from 'src/entities/account.entity';

@CustomRepository(AccountEntity)
export class AccountRepository extends Repository<AccountEntity> {}
