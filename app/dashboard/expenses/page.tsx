"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AccountButton } from "@/components/account-button"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useExpenses, useCreateExpense, useMarkExpensePaid, useSetExpenseAmount } from "@/hooks/use-expenses"
import { useWallet } from "@/hooks/use-wallet"
import { Loader2, Plus, Receipt, DollarSign, Check, Edit, ArrowLeft, Calendar } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ExpensesPage() {
  const { t } = useI18n()
  const { address, isConnected } = useWallet()
  const { commune, members, isLoading: communeLoading } = useCommuneData()
  const { expenses, isLoading: expensesLoading, refreshExpenses } = useExpenses(commune?.id)
  
  const [newExpenseOpen, setNewExpenseOpen] = useState(false)
  const [editAmountOpen, setEditAmountOpen] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  
  const [newExpenseForm, setNewExpenseForm] = useState({
    description: "",
    amount: "",
    hasAmount: false,
    assignees: [] as string[]
  })
  
  const [newAmount, setNewAmount] = useState("")
  
  const { createExpense, isPending: creating } = useCreateExpense()
  const { markExpensePaid, isPending: markingPaid } = useMarkExpensePaid()
  const { setExpenseAmount, isPending: settingAmount } = useSetExpenseAmount()

  const handleCreateExpense = () => {
    if (!commune || !newExpenseForm.description) {
      toast.error("Please fill in all required fields")
      return
    }

    const assignees = newExpenseForm.assignees.length > 0 ? newExpenseForm.assignees : [address!]

    createExpense(
      commune.id, 
      newExpenseForm.description, 
      assignees,
      newExpenseForm.hasAmount ? newExpenseForm.amount : undefined
    )
    
    setNewExpenseForm({
      description: "",
      amount: "",
      hasAmount: false,
      assignees: []
    })
    setNewExpenseOpen(false)
    
    // Refresh expenses after a delay
    setTimeout(() => {
      refreshExpenses()
    }, 3000)
  }

  const handleMarkPaid = (expenseId: string) => {
    markExpensePaid(expenseId)
    setTimeout(() => {
      refreshExpenses()
    }, 3000)
  }

  const handleSetAmount = () => {
    if (!selectedExpenseId || !newAmount) return
    
    setExpenseAmount(selectedExpenseId, newAmount)
    setEditAmountOpen(false)
    setSelectedExpenseId(null)
    setNewAmount("")
    
    setTimeout(() => {
      refreshExpenses()
    }, 3000)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getUsernameByAddress = (address: string) => {
    const member = members.find(m => m.address.toLowerCase() === address.toLowerCase())
    return member?.username || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-charcoal/70 mb-4">Please connect your wallet to view expenses.</p>
            <AccountButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (communeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">Loading commune data...</p>
        </div>
      </div>
    )
  }

  if (!commune) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">No Commune Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-charcoal/70">You're not a member of any commune yet.</p>
            <Link href="/join">
              <Button className="bg-sage hover:bg-sage/90 text-cream">
                Join a Commune
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
      {/* Header */}
      <header className="border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-charcoal/70 hover:text-charcoal">
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </Link>
            <div className="text-2xl font-serif">Expenses</div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <AccountButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">
              Expense Management
            </h1>
            <p className="text-charcoal/70">Track and split expenses with your commune members</p>
          </div>

          <Dialog open={newExpenseOpen} onOpenChange={setNewExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sage hover:bg-sage/90 text-cream">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Add New Expense</DialogTitle>
                <DialogDescription>
                  Create a new expense to track and split with commune members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What was this expense for?"
                    value={newExpenseForm.description}
                    onChange={(e) => setNewExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasAmount"
                    checked={newExpenseForm.hasAmount}
                    onChange={(e) => setNewExpenseForm(prev => ({ ...prev, hasAmount: e.target.checked }))}
                  />
                  <Label htmlFor="hasAmount">Set amount now</Label>
                </div>
                {newExpenseForm.hasAmount && (
                  <div>
                    <Label htmlFor="amount">Amount (ETH)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.001"
                      placeholder="0.1"
                      value={newExpenseForm.amount}
                      onChange={(e) => setNewExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                )}
                <div>
                  <Label>Assigned To</Label>
                  <p className="text-sm text-charcoal/60 mb-2">Leave empty to assign to yourself</p>
                  <div className="space-y-2">
                    {members.map(member => (
                      <div key={member.address} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`member-${member.address}`}
                          checked={newExpenseForm.assignees.includes(member.address)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewExpenseForm(prev => ({ 
                                ...prev, 
                                assignees: [...prev.assignees, member.address] 
                              }))
                            } else {
                              setNewExpenseForm(prev => ({ 
                                ...prev, 
                                assignees: prev.assignees.filter(a => a !== member.address) 
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`member-${member.address}`}>{member.username}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewExpenseOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExpense} disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Expense
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Expenses List */}
        {expensesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sage" />
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Receipt className="w-16 h-16 text-charcoal/30 mx-auto mb-4" />
                  <h3 className="text-xl font-serif text-charcoal mb-2">No expenses yet</h3>
                  <p className="text-charcoal/70 mb-4">Create your first expense to start tracking commune costs.</p>
                  <Button onClick={() => setNewExpenseOpen(true)} className="bg-sage hover:bg-sage/90 text-cream">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Expense
                  </Button>
                </CardContent>
              </Card>
            ) : (
              expenses.map(expense => (
                <Card key={expense.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-serif text-charcoal mb-1">{expense.description}</h3>
                        <p className="text-sm text-charcoal/60">
                          Created by {getUsernameByAddress(expense.creator)} on {formatDate(expense.createdAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-charcoal/70">Assigned to:</span>
                          {expense.assignedTo.map(address => (
                            <Badge key={address} variant="secondary">
                              {getUsernameByAddress(address)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {expense.hasAmount ? (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-charcoal">
                              {expense.amount} ETH
                            </div>
                            <div className="text-sm text-charcoal/60">
                              {expense.isPaid ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Check className="w-3 h-3 mr-1" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-orange-200 text-orange-700">
                                  Unpaid
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedExpenseId(expense.id)
                              setEditAmountOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Set Amount
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {expense.hasAmount && !expense.isPaid && (
                      <div className="pt-4 border-t border-charcoal/10">
                        <Button
                          onClick={() => handleMarkPaid(expense.id)}
                          disabled={markingPaid}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {markingPaid && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Paid
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Set Amount Dialog */}
        <Dialog open={editAmountOpen} onOpenChange={setEditAmountOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Set Expense Amount</DialogTitle>
              <DialogDescription>
                Enter the amount for this expense.
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="newAmount">Amount (ETH)</Label>
              <Input
                id="newAmount"
                type="number"
                step="0.001"
                placeholder="0.1"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAmountOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetAmount} disabled={settingAmount}>
                {settingAmount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Set Amount
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}