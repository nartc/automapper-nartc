import { AutoMapper, Mapper } from '../src/automapper'

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('AutoMapper is instantiable', () => {
    expect(Mapper).toBeInstanceOf(AutoMapper)
  })
})
