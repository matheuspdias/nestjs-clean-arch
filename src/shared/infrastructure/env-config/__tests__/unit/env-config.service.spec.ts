import { Test, TestingModule } from '@nestjs/testing'
import { EnvConfigModule } from '../../env-config.module'
import { EnvConfigService } from '../../env-config.service'

describe('EnvConfigService unit tests', () => {
  // sut = system under test
  let sut: EnvConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvConfigModule.forRoot()],
      providers: [EnvConfigService],
    }).compile()

    sut = module.get<EnvConfigService>(EnvConfigService)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should return the variable PORT', () => {
    expect(sut.getAppPort()).toBe(3000)
  })

  it('should return the variable NODE_ENV', () => {
    expect(sut.getNodeEnv()).toBe('test')
  })
})
