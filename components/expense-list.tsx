"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import { useMarkExpensePaid } from "@/hooks/use-mark-expense-paid"
import { useCommuneData } from "@/hooks/use-commune-data"
import type { Expense } from "@/types/commune"
import { DollarSign, Calendar, User, AlertCircle, Sparkles, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { DisputeExpenseDialog } from "@/components/dispute-expense-dialog"
import { Confetti } from "@/components/ui/confetti"

interface ExpenseListProps {
  expenses: Expense[]
  communeId: string
  filterAssignedToMe?: boolean
  onOptimisticMarkPaid?: (expenseId: string) => void
  onRefresh: () => void
  pendingCreateIds?: Set<string>
  confirmedCreateIds?: Set<string>
}

export function ExpenseList({ expenses, communeId, filterAssignedToMe = false, onOptimisticMarkPaid, onRefresh, pendingCreateIds, confirmedCreateIds }: ExpenseListProps) {
  const { t } = useI18n()
  const { markPaid } = useMarkExpensePaid(communeId, onRefresh)
  const [successExpenseId, setSuccessExpenseId] = useState<string | null>(null)
  const [pendingExpenseIds, setPendingExpenseIds] = useState<Set<string>>(new Set())
  const [confirmedExpenseIds, setConfirmedExpenseIds] = useState<Set<string>>(new Set())
  const [markingExpenseId, setMarkingExpenseId] = useState<string | null>(null)

  const filteredExpenses = filterAssignedToMe ? expenses.filter((e) => e.isAssignedToUser) : expenses

  const unpaidExpenses = filteredExpenses.filter((e) => !e.paid && !e.disputed)
  const paidExpenses = filteredExpenses.filter((e) => e.paid && !e.disputed)
  const disputedExpenses = filteredExpenses.filter((e) => e.disputed)

  const handleMarkPaid = async (expenseId: string) => {
    // Don't allow marking temporary expenses as paid
    if (expenseId.startsWith('temp-')) {
      console.warn('Cannot mark temporary expense as paid')
      return
    }

    // Optimistically update UI immediately
    if (onOptimisticMarkPaid) {
      onOptimisticMarkPaid(expenseId)
    }
    setSuccessExpenseId(expenseId)
    setTimeout(() => setSuccessExpenseId(null), 1500)

    // Track which expense is being marked
    setMarkingExpenseId(expenseId)

    // Track pending transaction
    setPendingExpenseIds(prev => new Set(prev).add(expenseId))

    try {
      await markPaid(expenseId)
      // Transaction confirmed
      setConfirmedExpenseIds(prev => new Set(prev).add(expenseId))
      setPendingExpenseIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(expenseId)
        return newSet
      })

      // Clear confirmed status after 2 seconds
      setTimeout(() => {
        setConfirmedExpenseIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(expenseId)
          return newSet
        })
      }, 2000)
    } catch (error) {
      // Remove from pending on error
      setPendingExpenseIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(expenseId)
        return newSet
      })
    } finally {
      // Clear marking state
      setMarkingExpenseId(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <ExpenseColumn
        title={t("expenses.unpaid")}
        expenses={unpaidExpenses}
        communeId={communeId}
        onMarkPaid={handleMarkPaid}
        markingExpenseId={markingExpenseId}
        onRefresh={onRefresh}
        successExpenseId={successExpenseId}
        pendingExpenseIds={pendingExpenseIds}
        confirmedExpenseIds={confirmedExpenseIds}
        pendingCreateIds={pendingCreateIds}
        confirmedCreateIds={confirmedCreateIds}
        emptyMessage={t("expenses.noExpenses")}
      />
      <ExpenseColumn
        title={t("expenses.paid")}
        expenses={paidExpenses}
        communeId={communeId}
        isPaid
        pendingExpenseIds={pendingExpenseIds}
        confirmedExpenseIds={confirmedExpenseIds}
        pendingCreateIds={pendingCreateIds}
        confirmedCreateIds={confirmedCreateIds}
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
  markingExpenseId?: string | null
  onRefresh?: () => void
  successExpenseId?: string | null
  pendingExpenseIds?: Set<string>
  confirmedExpenseIds?: Set<string>
  pendingCreateIds?: Set<string>
  confirmedCreateIds?: Set<string>
  emptyMessage: string
}

function ExpenseColumn({
  title,
  expenses,
  communeId,
  isPaid,
  isDisputed,
  onMarkPaid,
  markingExpenseId,
  onRefresh,
  successExpenseId,
  pendingExpenseIds,
  confirmedExpenseIds,
  pendingCreateIds,
  confirmedCreateIds,
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
              isMarking={markingExpenseId === expense.id}
              onRefresh={onRefresh}
              isSuccess={successExpenseId === expense.id}
              isPending={
                expense.id.startsWith('temp-')
                  ? (pendingCreateIds?.has(expense.id) || false)
                  : (pendingExpenseIds?.has(expense.id) || false)
              }
              isConfirmed={
                expense.id.startsWith('temp-')
                  ? (confirmedCreateIds?.has(expense.id) || false)
                  : (confirmedExpenseIds?.has(expense.id) || false)
              }
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
  isSuccess?: boolean
  isPending?: boolean
  isConfirmed?: boolean
}

function ExpenseCard({
  expense,
  communeId,
  isPaid,
  isDisputed,
  onMarkPaid,
  isMarking,
  onRefresh,
  isSuccess,
  isPending,
  isConfirmed
}: ExpenseCardProps) {
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
        <Card className={`${isOverdue ? "border-red-300 bg-red-50/50" : ""} ${isSuccess ? "ring-2 ring-sage/50" : ""} relative overflow-hidden`}>
          <AnimatePresence>
            {isSuccess && (
              <>
                <Confetti active={isSuccess} />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <Sparkles className="w-6 h-6 text-sage" />
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Transaction status indicator */}
          {(isPending || isConfirmed) && (
            <div className="absolute top-3 right-3 z-20">
              {isPending && !isConfirmed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="flex items-center gap-2 bg-sage/10 rounded-full px-3 py-1">
                    <Loader2 className="w-3 h-3 animate-spin text-sage" />
                    <span className="text-xs text-sage font-medium">Processing...</span>
                  </div>
                </motion.div>
              )}
              {isConfirmed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="flex items-center gap-2 bg-green-100 rounded-full px-3 py-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Confirmed!</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

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

            {!isPaid && !isDisputed && expense.isAssignedToUser && onMarkPaid && !expense.id.startsWith('temp-') && (
              <Button
                onClick={() => onMarkPaid(expense.id)}
                disabled={isMarking}
                size="sm"
                className="w-full bg-sage hover:bg-sage/90"
              >
                {isMarking ? t("expenses.markingPaid") : t("expenses.markPaid")}
              </Button>
            )}

            {!isDisputed && !expense.isAssignedToUser && !expense.id.startsWith('temp-') && (
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