import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAccessToken } from '../../redux/features/auth/authSlice'


const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

const  CalendarPage=()=> {
  const [currentMonth, setCurrentMonth] = useState(2) // March
  const [currentYear, setCurrentYear] = useState(2024)

  const calendarData = [
    { date: 1, dots: ['🔴', '🔵', '🟣'] },
    { date: 2 },
    { date: 3 },
    { date: 4 },
    { date: 5 },
    { date: 6, dots: ['⚪', '⚪', '⚪'] },
    { date: 7 },
    { date: 8 },
    { date: 9, title: 'Franklin, 2+', price: '$600.00', highlighted: true },
    { date: 10 },
    { date: 11 },
    { date: 12 },
    { date: 13 },
    { date: 14 },
    { date: 15, dots: ['⚪', '⚪'] },
    { date: 16 },
    { date: 17 },
    { date: 18, title: 'Franklin, 2+', price: '$600.00' },
    { date: 19 },
    { date: 20, dots: ['🟢', '🔵', '🟣'], highlighted: true },
    { date: 21 },
    { date: 22 },
    { date: 23 },
    { date: 24 },
    { date: 25, highlighted: true },
    { date: 26 },
    { date: 27 },
    { date: 28 },
    { date: 29, dots: ['🟢', '🔵', '🟣'] },
    { date: 30 },
    { date: 31 },
  ]

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const acc=useSelector(selectAccessToken)
  console.log(acc,"ở acc");
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 mx-auto max-w-7xl">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 transition-colors rounded-lg hover:bg-slate-800">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <h1 className="text-3xl font-bold text-white">
              {MONTHS[currentMonth]} {currentYear}
            </h1>
            <button onClick={nextMonth} className="p-2 transition-colors rounded-lg hover:bg-slate-800">
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <button className="px-6 py-3 font-semibold text-white transition-all transform rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 hover:scale-105">
            +New Schedule
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6 overflow-hidden border bg-slate-800/30 backdrop-blur border-slate-700/50 rounded-2xl">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-4 mb-6">
            {DAYS.map((day) => (
              <div key={day} className="py-2 text-sm font-semibold text-center text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Dates */}
          <div className="grid grid-cols-7 gap-4">
            {/* Previous month's dates */}
            {[30].map((date) => (
              <div key={`prev-${date}`} className="flex items-center justify-center border rounded-lg aspect-square text-slate-600 border-slate-700/30 bg-slate-900/20">
                <span>{date}</span>
              </div>
            ))}

            {/* Current month's dates */}
            {calendarData.map((event) => (
              <div
                key={event.date}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer group relative ${
                  event.highlighted
                    ? 'bg-gradient-to-br from-purple-600/40 to-purple-900/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'border-slate-700/30 hover:border-slate-600/50'
                }`}
              >
                <span className="mb-2 text-lg font-bold text-white">{event.date}</span>

                {event.title && (
                  <div className="text-xs text-center">
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-orange-400">{event.price}</p>
                  </div>
                )}

                {event.dots && (
                  <div className="flex gap-1 mt-1">
                    {event.dots.map((dot, i) => (
                      <span key={i} className="text-xs">
                        {dot}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Next month's dates */}
            {[1, 2, 3].map((date) => (
              <div key={`next-${date}`} className="flex items-center justify-center border rounded-lg aspect-square text-slate-600 border-slate-700/30 bg-slate-900/20">
                <span>{date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default CalendarPage