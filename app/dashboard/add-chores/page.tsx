"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle2, AlertCircle, Plus, ArrowLeft } from "lucide-react"
import { useCreateChoreSchedule, ChoreFrequency, type OptimisticChoreSchedule } from "@/hooks/use-create-chore-schedule"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n/context"
import { AccountButton } from "@/components/account-button"
import { LanguageToggle } from "@/components/language-toggle"

export default function AddChoresPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { address, isConnected } = useWallet()
  const { commune, isLoading: isLoadingCommune, refreshData } = useCommuneData()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<ChoreFrequency>(ChoreFrequency.WEEKLY)
  const [createdChores, setCreatedChores] = useState<OptimisticChoreSchedule[]>([])

  const { createChoreSchedule, isCreating } = useCreateChoreSchedule(commune?.id || "")

  // Check if user is the creator
  const isCreator = commune?.creator.toLowerCase() === address?.toLowerCase()

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/dashboard")
    }
  }, [isConnected, router])

  // Redirect if not creator
  useEffect(() => {
    if (commune && !isCreator) {
      toast({
        title: t("addChores.accessDenied"),
        description: t("addChores.accessDeniedDesc"),
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [commune, isCreator, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: t("addChores.titleRequired"),
        description: t("addChores.titleRequiredDesc"),
        variant: "destructive",
      })
      return
    }

    // Generate temporary ID
    const tempId = `temp-${Date.now()}`

    // Add optimistically to list with pending status
    const optimisticChore: OptimisticChoreSchedule = {
      id: tempId,
      title: title.trim(),
      description: description.trim(),
      frequency,
      status: "pending",
    }

    setCreatedChores((prev) => [...prev, optimisticChore])

    // Reset form immediately
    setTitle("")
    setDescription("")
    setFrequency(ChoreFrequency.WEEKLY)

    // Submit transaction in background
    try {
      await createChoreSchedule(
        {
          title: optimisticChore.title,
          description: optimisticChore.description,
          frequency: optimisticChore.frequency,
        },
        () => {
          // On success - update status to confirmed
          setCreatedChores((prev) =>
            prev.map((chore) =>
              chore.id === tempId ? { ...chore, status: "confirmed" } : chore
            )
          )
          toast({
            title: t("addChores.choreAdded"),
            description: t("addChores.choreAddedDesc").replace("{{title}}", optimisticChore.title),
          })
          // Refresh chore data so it appears in kanban/calendar
          refreshData()
        },
        (error) => {
          // On error - update status to failed
          setCreatedChores((prev) =>
            prev.map((chore) =>
              chore.id === tempId
                ? { ...chore, status: "failed", error: error.message }
                : chore
            )
          )
          toast({
            title: t("addChores.failedToAddChore"),
            description: error.message || t("common.tryAgain"),
            variant: "destructive",
          })
        }
      )
    } catch (error) {
      // Error already handled in callbacks
      console.error("Chore creation error:", error)
    }
  }

  const handleRetry = async (chore: OptimisticChoreSchedule) => {
    // Update status to pending
    setCreatedChores((prev) =>
      prev.map((c) => (c.id === chore.id ? { ...c, status: "pending", error: undefined } : c))
    )

    try {
      await createChoreSchedule(
        {
          title: chore.title,
          description: chore.description,
          frequency: chore.frequency,
        },
        () => {
          setCreatedChores((prev) =>
            prev.map((c) => (c.id === chore.id ? { ...c, status: "confirmed" } : c))
          )
          toast({
            title: t("addChores.choreAdded"),
            description: t("addChores.choreAddedDesc").replace("{{title}}", chore.title),
          })
          // Refresh chore data so it appears in kanban/calendar
          refreshData()
        },
        (error) => {
          setCreatedChores((prev) =>
            prev.map((c) =>
              c.id === chore.id ? { ...c, status: "failed", error: error.message } : c
            )
          )
          toast({
            title: t("addChores.failedToAddChore"),
            description: error.message || t("common.tryAgain"),
            variant: "destructive",
          })
        }
      )
    } catch (error) {
      console.error("Chore retry error:", error)
    }
  }

  const handleRemove = (choreId: string) => {
    setCreatedChores((prev) => prev.filter((c) => c.id !== choreId))
  }

  const getFrequencyLabel = (freq: ChoreFrequency) => {
    switch (freq) {
      case ChoreFrequency.DAILY:
        return t("addChores.daily")
      case ChoreFrequency.WEEKLY:
        return t("addChores.weekly")
      case ChoreFrequency.MONTHLY:
        return t("addChores.monthly")
      default:
        return t("calendar.everyXDays").replace("{{days}}", freq.toString())
    }
  }

  const getFrequencyBadgeVariant = (freq: ChoreFrequency): "default" | "secondary" | "outline" => {
    switch (freq) {
      case ChoreFrequency.DAILY:
        return "default"
      case ChoreFrequency.WEEKLY:
        return "secondary"
      case ChoreFrequency.MONTHLY:
        return "outline"
      default:
        return "outline"
    }
  }

  if (!isConnected) {
    return null
  }

  if (isLoadingCommune) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto" />
          <p className="text-charcoal/70">{t("addChores.loading")}</p>
        </div>
      </div>
    )
  }

  if (!commune || !isCreator) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream">
      {/* Header */}
      <header className="border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-serif">シェアハウス</div>
            <div className="text-xl font-sans tracking-wide">ShareHouse</div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <AccountButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("addChores.backToDashboard")}
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">
            {t("addChores.title")}
          </h1>
          <p className="text-charcoal/70">
            {t("addChores.subtitle")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Chore Form */}
          <Card className="border-sage/30 bg-white/50">
            <CardHeader>
              <CardTitle className="font-serif text-charcoal">{t("addChores.newChore")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {t("addChores.choreTitle")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("addChores.choreTitlePlaceholder")}
                    maxLength={100}
                    className="bg-white"
                  />
                  <p className="text-xs text-charcoal/60">{title.length}/100</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t("addChores.description")}</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("addChores.descriptionPlaceholder")}
                    maxLength={500}
                    className="bg-white min-h-[80px]"
                  />
                  <p className="text-xs text-charcoal/60">{description.length}/500</p>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency">
                    {t("addChores.frequency")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={frequency.toString()}
                    onValueChange={(value) => setFrequency(Number.parseInt(value) as ChoreFrequency)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ChoreFrequency.DAILY.toString()}>{t("addChores.daily")}</SelectItem>
                      <SelectItem value={ChoreFrequency.WEEKLY.toString()}>{t("addChores.weekly")}</SelectItem>
                      <SelectItem value={ChoreFrequency.MONTHLY.toString()}>{t("addChores.monthly")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-charcoal/60">{t("addChores.frequencyHelper")}</p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isCreating || !title.trim()}
                  className="w-full bg-sage hover:bg-sage/90 text-cream"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("addChores.adding")}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("addChores.addChore")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Created Chores List */}
          {createdChores.length > 0 && (
            <Card className="border-charcoal/10">
              <CardHeader>
                <CardTitle className="font-serif text-charcoal flex items-center justify-between">
                  <span>{t("addChores.choresAddedThisSession")}</span>
                  <Badge variant="outline">{createdChores.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {createdChores.map((chore) => (
                    <Card key={chore.id} className="border-charcoal/10 bg-white/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <h4 className="font-medium text-charcoal">{chore.title}</h4>
                              {chore.status === "pending" && (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  {t("addChores.pending")}
                                </Badge>
                              )}
                              {chore.status === "confirmed" && (
                                <Badge variant="outline" className="border-sage text-sage">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {t("addChores.confirmed")}
                                </Badge>
                              )}
                              {chore.status === "failed" && (
                                <Badge variant="outline" className="border-red-500 text-red-700">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {t("addChores.failed")}
                                </Badge>
                              )}
                            </div>
                            {chore.description && (
                              <p className="text-sm text-charcoal/70">{chore.description}</p>
                            )}
                            <Badge variant={getFrequencyBadgeVariant(chore.frequency)}>
                              {getFrequencyLabel(chore.frequency)}
                            </Badge>
                            {chore.error && (
                              <p className="text-xs text-red-600">{chore.error}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {chore.status === "failed" && (
                              <Button
                                onClick={() => handleRetry(chore)}
                                size="sm"
                                variant="outline"
                                className="border-sage text-sage hover:bg-sage/10"
                              >
                                {t("addChores.retry")}
                              </Button>
                            )}
                            {(chore.status === "failed" || chore.status === "pending") && (
                              <Button
                                onClick={() => handleRemove(chore.id)}
                                size="sm"
                                variant="ghost"
                                className="text-charcoal/60 hover:text-charcoal"
                              >
                                {t("addChores.remove")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-charcoal/20">
                {t("addChores.backToDashboard")}
              </Button>
            </Link>
            <p className="text-sm text-charcoal/60">
              {t("addChores.confirmed_count").replace("{{count}}", createdChores.filter((c) => c.status === "confirmed").length.toString())}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
