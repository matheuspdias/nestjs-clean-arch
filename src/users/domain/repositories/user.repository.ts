import { SearchableRepositoryInterface } from '@/shared/domain/repositories/searchable-repository-contracts'
import { UserEntity } from '../entities/user.entity'
import { Filter, SearchParams, SearchResult } from './user-repository.types'

export interface UserRepository
  extends SearchableRepositoryInterface<
    UserEntity,
    Filter,
    SearchParams,
    SearchResult
  > {
  findByEmail(email: string): Promise<UserEntity>
  emailExists(email: string): Promise<void>
}
