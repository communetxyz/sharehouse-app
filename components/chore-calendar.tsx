"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChoreInstance, Expense } from "@/types/commune"
import { useEnsNameOrAddress } from "@/hooks/use-ens-name"
import { useLanguage } from "@/lib/i18n/context"
import { useCalendarChores } from "@/hooks/use-calendar-chores"
import { useCalendarExpenses } from "@/hooks/use-calendar-expenses"

interface ChoreCalendarProps {
  chores: ChoreInstance[]
}

function ChoreItem({ chore }: { chore: ChoreInstance }) {
  const assignedToName = useEnsNameOrAddress(chore.assignedTo)

  return (
    <div
      className={`text-xs p-1.5 rounded mb-1 ${
        chore.completed
          ? "bg-sage/20 border border-sage/30 line-through opacity-60"
          : chore.isAssignedToUser
            ? "bg-sage/10 border border-sage/40"
            : "bg-charcoal/5 border border-charcoal/10"
      }`}
    >
      <div className="font-medium truncate">{chore.title}</div>
      <div className="text-charcoal/60 truncate">{assignedToName}</div>
    </div>
  )
}

function ExpenseItem({ expense }: { expense: Expense }) {
  const assignedToName = useEnsNameOrAddress(expense.assignedTo)

  return (
    <div
      className={`text-xs p-1.5 rounded mb-1 border-l-2 ${
        expense.disputed
          ? "bg-red-50 border-red-400"
          : expense.paid
            ? "bg-green-50 border-green-400"
            : expense.isAssignedToUser
              ? "bg-blue-50 border-blue-400"
              : "bg-amber-50 border-amber-400"
      }`}
    >
      <div className="font-medium truncate">💰 {expense.description}</div>
      <div className="text-charcoal/60 truncate">{expense.amount} Collateral Currency</div>
      <div className="text-charcoal/60 truncate">{assignedToName}</div>
    </div>
  )
}

function isSameUTCDay(timestamp: number, year: number, month: number, day: number): boolean {
  const date = new Date(timestamp * 1000)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day
}

export function ChoreCalendar({ chores }: ChoreCalendarProps) {
  const { t } = useLanguage()
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const { chores: fetchedChores, isLoading: isLoadingChores } = useCalendarChores(year, month)
  const { expenses, isLoading: isLoadingExpenses } = useCalendarExpenses()

  const isLoading = isLoadingChores || isLoadingExpenses

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const isToday = (day: number | null) => {
    if (!day) return false
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <Card className="border-charcoal/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-charcoal">
            {monthNames[month]} {year}
            {isLoading && <span className="text-sm font-normal text-charcoal/60 ml-2">Loading...</span>}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-charcoal/60 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayChores = day
              ? fetchedChores.filter((chore) => isSameUTCDay(chore.periodStart, year, month, day))
              : []
            const dayExpenses = day ? expenses.filter((expense) => isSameUTCDay(expense.dueDate, year, month, day)) : []

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 rounded-lg border ${
                  day
                    ? isToday(day)
                      ? "bg-sage/10 border-sage/40"
                      : "bg-white/50 border-charcoal/10"
                    : "bg-transparent border-transparent"
                }`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday(day) ? "text-sage font-bold" : "text-charcoal/70"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[90px]">
                      {dayChores.map((chore) => (
                        <ChoreItem key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />
                      ))}
                      {dayExpenses.map((expense) => (
                        <ExpenseItem key={expense.id} expense={expense} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-charcoal/10 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-sage/10 border border-sage/40" />
            <span className="text-charcoal/70">My chores</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-charcoal/5 border border-charcoal/10" />
            <span className="text-charcoal/70">Other chores</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-sage/20 border border-sage/30" />
            <span className="text-charcoal/70">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-50 border-l-2 border-blue-400" />
            <span className="text-charcoal/70">My expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-50 border-l-2 border-amber-400" />
            <span className="text-charcoal/70">Other expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-50 border-l-2 border-green-400" />
            <span className="text-charcoal/70">Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-50 border-l-2 border-red-400" />
            <span className="text-charcoal/70">Disputed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
