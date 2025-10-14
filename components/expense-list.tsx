"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import { useMarkExpensePaid } from "@/hooks/use-mark-expense-paid"
import { useCommuneData } from "@/hooks/use-commune-data"
import type { Expense } from "@/types/commune"
import { DollarSign, Calendar, User, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { DisputeExpenseDialog } from "@/components/dispute-expense-dialog"

interface ExpenseListProps {
  expenses: Expense[]
  communeId: string
  filterAssignedToMe?: boolean
  onRefresh: () => void
}

export function ExpenseList({ expenses, communeId, filterAssignedToMe = false, onRefresh }: ExpenseListProps) {
  const { t } = useI18n()
  const { markPaid, isMarking } = useMarkExpensePaid(communeId, onRefresh)

  const filteredExpenses = filterAssignedToMe ? expenses.filter((e) => e.isAssignedToUser) : expenses

  const unpaidExpenses = filteredExpenses.filter((e) => !e.paid && !e.disputed)
  const paidExpenses = filteredExpenses.filter((e) => e.paid && !e.disputed)
  const disputedExpenses = filteredExpenses.filter((e) => e.disputed)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <ExpenseColumn
        title={t("expenses.unpaid")}
        expenses={unpaidExpenses}
        communeId={communeId}
        onMarkPaid={markPaid}
        isMarking={isMarking}
        onRefresh={onRefresh}
        emptyMessage={t("expenses.noExpenses")}
      />
      <ExpenseColumn
        title={t("expenses.paid")}
        expenses={paidExpenses}
        communeId={communeId}
        isPaid
        emptyMessage={t("expenses.noPaidExpenses")}
      />
      <ExpenseColumn
        title={t("expenses.disputed")}
        expenses={disputedExpenses}
        communeId={communeId}
        isDisputed
        onRefresh={onRefresh}
        emptyMessage={t("expenses.noExpenses")}
      />
    </div>
  )
}

interface ExpenseColumnProps {
  title: string
  expenses: Expense[]
  communeId: string
  isPaid?: boolean
  isDisputed?: boolean
  onMarkPaid?: (expenseId: string) => void
  isMarking?: boolean
  onRefresh?: () => void
  emptyMessage: string
}

function ExpenseColumn({
  title,
  expenses,
  communeId,
  isPaid,
  isDisputed,
  onMarkPaid,
  isMarking,
  onRefresh,
  emptyMessage,
}: ExpenseColumnProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-charcoal">{title}</h3>
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-sm text-charcoal/50">{emptyMessage}</p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              communeId={communeId}
              isPaid={isPaid}
              isDisputed={isDisputed}
              onMarkPaid={onMarkPaid}
              isMarking={isMarking}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface ExpenseCardProps {
  expense: Expense
  communeId: string
  isPaid?: boolean
  isDisputed?: boolean
  onMarkPaid?: (expenseId: string) => void
  isMarking?: boolean
  onRefresh?: () => void
}

function ExpenseCard({ expense, communeId, isPaid, isDisputed, onMarkPaid, isMarking, onRefresh }: ExpenseCardProps) {
  const { t } = useI18n()
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const { members } = useCommuneData()

  const isOverdue = !expense.paid && expense.dueDate < Date.now() / 1000

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={isOverdue ? "border-red-300 bg-red-50/50" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base font-medium text-charcoal">{expense.description}</CardTitle>
              {isDisputed && (
                <Badge variant="destructive" className="ml-2">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {t("expenses.disputed")}
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {expense.amount} Collateral Currency
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(expense.dueDate * 1000).toLocaleDateString()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1 text-xs text-charcoal/70">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  {t("expenses.assignedTo")}: {expense.assignedToUsername}
                </span>
              </div>
            </div>

            {!isPaid && !isDisputed && expense.isAssignedToUser && onMarkPaid && (
              <Button
                onClick={() => onMarkPaid(expense.id)}
                disabled={isMarking}
                size="sm"
                className="w-full bg-sage hover:bg-sage/90"
              >
                {isMarking ? t("expenses.markingPaid") : t("expenses.markPaid")}
              </Button>
            )}

            {!isDisputed && !expense.isAssignedToUser && (
              <Button onClick={() => setShowDisputeDialog(true)} size="sm" variant="outline" className="w-full">
                {t("expenses.dispute")}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <DisputeExpenseDialog
        open={showDisputeDialog}
        onOpenChange={setShowDisputeDialog}
        expenseId={expense.id}
        currentAssignee={expense.assignedTo}
        communeId={communeId}
        members={members}
        onRefresh={onRefresh || (() => {})}
      />
    </>
  )
}
