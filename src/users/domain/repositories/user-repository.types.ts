import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
} from '@/shared/domain/repositories/searchable-repository-contracts'
import { UserEntity } from '../entities/user.entity'

export type Filter = string

export class SearchParams extends DefaultSearchParams<Filter> {}

export class SearchResult extends DefaultSearchResult<UserEntity, Filter> {}
