"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useExpenses, useCreateExpense } from "@/hooks/use-expenses"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useWallet } from "@/hooks/use-wallet"
import { ShoppingCart, Plus, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ShoppingList() {
  const { address } = useWallet()
  const { commune, members } = useCommuneData()
  const { expenses, refreshExpenses } = useExpenses(commune?.id)
  const { createExpense, isPending: creating } = useCreateExpense()
  
  const [newItemOpen, setNewItemOpen] = useState(false)
  const [newItem, setNewItem] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")

  // Filter for shopping-related expenses (could be enhanced with tags)
  const shoppingItems = expenses.filter(expense => 
    expense.description.toLowerCase().includes('shop') || 
    expense.description.toLowerCase().includes('buy') ||
    expense.description.toLowerCase().includes('grocery') ||
    expense.description.toLowerCase().includes('supplies')
  )

  const handleAddItem = () => {
    if (!commune || !newItem.trim()) {
      toast.error("Please enter an item name")
      return
    }

    const description = `Shopping: ${newItem.trim()}`
    
    createExpense(
      commune.id,
      description,
      [address!], // Assign to self initially
      estimatedCost || undefined
    )

    setNewItem("")
    setEstimatedCost("")
    setNewItemOpen(false)
    
    setTimeout(() => {
      refreshExpenses()
    }, 3000)
  }

  const getUsernameByAddress = (address: string) => {
    const member = members.find(m => m.address.toLowerCase() === address.toLowerCase())
    return member?.username || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!commune) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping List
            </CardTitle>
            <CardDescription>
              Track shopping needs and expenses for the commune
            </CardDescription>
          </div>
          
          <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-sage hover:bg-sage/90 text-cream">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Shopping Item</DialogTitle>
                <DialogDescription>
                  Add a new item to the commune shopping list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Milk, Bread, Cleaning supplies"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost (ETH) - Optional</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewItemOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem} disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {shoppingItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
            <p className="text-charcoal/70 mb-4">No shopping items yet</p>
            <Button onClick={() => setNewItemOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {shoppingItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-charcoal/10 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {item.description.replace(/^Shopping:\s*/, '')}
                    </span>
                    {item.isPaid && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Purchased
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-charcoal/60">
                    Added by {getUsernameByAddress(item.creator)}
                    {item.hasAmount && (
                      <span className="ml-2">• {item.amount} ETH</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}