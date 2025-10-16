"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ChoreInstance, Task } from "@/types/commune"
import { useLanguage } from "@/lib/i18n/context"
import { useCalendarChores } from "@/hooks/use-calendar-chores"
import { useCalendarTasks } from "@/hooks/use-calendar-tasks"
import { useState, useEffect } from "react"
import { Calendar, CalendarDays, CalendarRange } from "lucide-react"

type CalendarView = "daily" | "weekly" | "monthly"

interface ChoreCalendarProps {
  chores: ChoreInstance[]
}

function ChoreItem({ chore }: { chore: ChoreInstance }) {
  const [choreEmoji, setChoreEmoji] = useState("")

  useEffect(() => {
    // Load emoji from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`chore-emoji-${chore.scheduleId}`)
      if (stored) {
        setChoreEmoji(stored)
      }
    }
  }, [chore.scheduleId])

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
      <div className="font-medium truncate">
        {choreEmoji && <span className="mr-1">{choreEmoji}</span>}
        {chore.title}
      </div>
      <div className="text-charcoal/60 truncate">{chore.assignedToUsername}</div>
    </div>
  )
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div
      className={`text-xs p-1.5 rounded mb-1 border-l-2 ${
        task.disputed
          ? "bg-red-50 border-red-400"
          : task.done
            ? "bg-green-50 border-green-400"
            : task.isAssignedToUser
              ? "bg-blue-50 border-blue-400"
              : "bg-amber-50 border-amber-400"
      }`}
    >
      <div className="font-medium truncate">💰 {task.description}</div>
      <div className="text-charcoal/60 truncate">{task.budget} Collateral Currency</div>
      <div className="text-charcoal/60 truncate">{task.assignedToUsername}</div>
    </div>
  )
}

function isSameUTCDay(timestamp: number, year: number, month: number, day: number): boolean {
  const date = new Date(timestamp * 1000)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day
}

export function ChoreCalendar({ chores }: ChoreCalendarProps) {
  const { t, language } = useLanguage()
  const [view, setView] = useState<CalendarView>("monthly")
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const { chores: fetchedChores, isLoading: isLoadingChores } = useCalendarChores(year, month)
  const { tasks, isLoading: isLoadingTasks } = useCalendarTasks()

  const isLoading = isLoadingChores || isLoadingTasks

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

  // Get month and day names based on language
  const monthNames = language === "ja"
    ? ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const dayNames = language === "ja"
    ? ["日", "月", "火", "水", "木", "金", "土"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const isToday = (day: number | null) => {
    if (!day) return false
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <Card className="border-charcoal/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="font-serif text-charcoal">
            {language === "ja" ? `${year}年 ${monthNames[month]}` : `${monthNames[month]} ${year}`}
            {isLoading && <span className="text-sm font-normal text-charcoal/60 ml-2">{t("calendar.loading")}</span>}
          </CardTitle>
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant={view === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("daily")}
              className={view === "daily" ? "bg-sage hover:bg-sage/90 text-cream" : ""}
            >
              <Calendar className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("calendar.daily")}</span>
            </Button>
            <Button
              variant={view === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("weekly")}
              className={view === "weekly" ? "bg-sage hover:bg-sage/90 text-cream" : ""}
            >
              <CalendarDays className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("calendar.weekly")}</span>
            </Button>
            <Button
              variant={view === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("monthly")}
              className={view === "monthly" ? "bg-sage hover:bg-sage/90 text-cream" : ""}
            >
              <CalendarRange className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("calendar.monthly")}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "daily" && (
          <div className="space-y-4">
            <div className="bg-sage/10 border border-sage/40 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-charcoal mb-3">
                {today.toLocaleDateString(
                  language === "ja" ? "ja-JP" : "en-US",
                  { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                )}
              </h3>
              <div className="space-y-2">
                {fetchedChores
                  .filter((chore) => isSameUTCDay(chore.periodStart, year, month, today.getDate()))
                  .map((chore) => (
                    <ChoreItem key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />
                  ))}
                {tasks
                  .filter((task) => isSameUTCDay(task.dueDate, year, month, today.getDate()))
                  .map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                {fetchedChores.filter((c) => isSameUTCDay(c.periodStart, year, month, today.getDate())).length === 0 &&
                  tasks.filter((t) => isSameUTCDay(t.dueDate, year, month, today.getDate())).length === 0 && (
                    <p className="text-sm text-charcoal/60 text-center py-4">{t("calendar.noItemsToday")}</p>
                  )}
              </div>
            </div>
          </div>
        )}

        {view === "weekly" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(today)
                date.setDate(today.getDate() - today.getDay() + i)
                const day = date.getDate()
                const isCurrentMonth = date.getMonth() === month
                const dayChores = isCurrentMonth
                  ? fetchedChores.filter((chore) => isSameUTCDay(chore.periodStart, year, date.getMonth(), day))
                  : []
                const dayTasks = isCurrentMonth
                  ? tasks.filter((task) => isSameUTCDay(task.dueDate, year, date.getMonth(), day))
                  : []
                const isCurrentDay = date.toDateString() === today.toDateString()

                return (
                  <div
                    key={i}
                    className={`min-h-[200px] sm:min-h-[350px] md:min-h-[500px] p-2 sm:p-3 rounded-lg border ${
                      isCurrentDay ? "bg-sage/10 border-sage/40" : "bg-white/50 border-charcoal/10"
                    }`}
                  >
                    <div className={`text-center mb-2 ${isCurrentDay ? "text-sage font-bold" : "text-charcoal/70"}`}>
                      <div className="text-xs font-medium">{dayNames[i]}</div>
                      <div className="text-lg">{day}</div>
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[150px] sm:max-h-[300px] md:max-h-[450px]">
                      {dayChores.map((chore) => (
                        <ChoreItem key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />
                      ))}
                      {dayTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === "monthly" && (
          <>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-charcoal/60 py-1 sm:py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const dayChores = fetchedChores.filter((chore) => isSameUTCDay(chore.periodStart, year, month, day))
                const dayTasks = tasks.filter((task) => isSameUTCDay(task.dueDate, year, month, day))

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-0.5 sm:p-1 overflow-hidden ${
                      isToday(day)
                        ? "bg-sage/10 border-sage/40"
                        : "border-charcoal/10 hover:bg-charcoal/5"
                    }`}
                  >
                    <div className="text-[10px] sm:text-xs font-medium text-charcoal mb-0.5 sm:mb-1">{day}</div>
                    <div className="space-y-0.5 sm:space-y-1 max-h-[40px] sm:max-h-[60px] md:max-h-[80px] overflow-y-auto">
                      {dayChores.map((chore) => (
                        <ChoreItem key={`${chore.scheduleId}-${chore.periodNumber}`} chore={chore} />
                      ))}
                      {dayTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
