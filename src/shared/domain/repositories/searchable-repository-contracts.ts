import { Entity } from '../entities/entity'
import { RepositoryInterface } from './repository-contracts'

export type SortDirection = 'asc' | 'desc'

export type SearchProps<Filter = string> = {
  page?: number
  perPage?: number
  sort?: string | null
  sortDir?: SortDirection | null
  filter?: Filter | null
}

export class SearchParams {
  protected _page: number
  protected _perPage = 15
  protected _sort: string | null
  protected _sortDir: SortDirection | null
  protected _filter: string | null
  constructor(props: SearchProps) {
    this._page = props.page
    this._perPage = props.perPage
    this._sort = props.sort
    this._sortDir = props.sortDir
    this._filter = props.filter
  }

  get page() {
    return this._page
  }

  private set page(value: number) {}

  get perPage() {
    return this._perPage
  }

  private setPerPage(value: number) {}

  get sort() {
    return this._sort
  }

  private setSort(value: string | null) {}

  get sortDir() {
    return this._sortDir
  }

  private setSortDir(value: string | null) {}

  get filter() {
    return this._filter
  }

  private setFilter(value: string | null) {}
}

export interface SearchbleRepositoryInterface<
  E extends Entity,
  SearchParams,
  SearchOutput,
> extends RepositoryInterface<E> {
  search(props: SearchParams): Promise<SearchOutput>
}
