export interface LunarDate {
  year: number
  month: number
  day: number
  isLeap: boolean
  dayName: string
  monthName: string
}

export interface HolidayPlan {
  /** 节假日名称，如「春节」 */
  name: string
  /** true = 放假，false = 调休上班 */
  isOffDay: boolean
}

export interface DayCell {
  date: Date
  key: string
  day: number
  lunar: LunarDate
  solarTerm: string | null
  festival: string | null
  holiday: HolidayPlan | null
  isToday: boolean
  isWeekend: boolean
}
