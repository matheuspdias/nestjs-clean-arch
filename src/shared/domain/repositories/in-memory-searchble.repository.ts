import { Entity } from '../entities/entity'
import { InMemoryRepository } from './in-memory.repository'
import { SearchbleRepositoryInterface } from './searchable-repository-contracts'

export abstract class InMemorySearchRepository<E extends Entity>
  extends InMemoryRepository<E>
  implements SearchbleRepositoryInterface<E, any, any>
{
  search(props: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
