import MockDate from 'mockdate'
import dayjs from '../../src'
import isWeekend from '../../src/plugin/isWeekend'
import utc from '../../src/plugin/utc'

dayjs.extend(isWeekend)
dayjs.extend(utc)

beforeEach(() => {
  MockDate.set(new Date())
})

afterEach(() => {
  MockDate.reset()
})

it('Saturday and Sunday are the weekend', () => {
  const cases = [
    ['2024-06-03', false], // Monday
    ['2024-06-04', false], // Tuesday
    ['2024-06-05', false], // Wednesday
    ['2024-06-06', false], // Thursday
    ['2024-06-07 23:59:59.999', false], // Friday
    ['2024-06-08 00:00:00.000', true], // Saturday
    ['2024-06-09 23:59:59.999', true], // Sunday
    ['2024-06-10 00:00:00.000', false] // Monday
  ]
  cases.forEach(([date, expected]) => {
    expect(dayjs(date).isWeekend()).toBe(expected)
  })
})

it('Follows the UTC offset of the instance', () => {
  const fridayNightUtc = dayjs.utc('2024-06-07 23:00')
  expect(fridayNightUtc.isWeekend()).toBe(false)
  expect(fridayNightUtc.utcOffset(120).isWeekend()).toBe(true)

  const sundayNightUtc = dayjs.utc('2024-06-09 23:00')
  expect(sundayNightUtc.isWeekend()).toBe(true)
  expect(sundayNightUtc.utcOffset(120).isWeekend()).toBe(false)
})

it('Invalid date is not the weekend', () => {
  expect(dayjs('not a date').isWeekend()).toBe(false)
})
