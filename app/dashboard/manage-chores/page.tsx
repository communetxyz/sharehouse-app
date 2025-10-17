"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import { useChoreSchedules } from "@/hooks/use-chore-schedules"
import { useRemoveChoreSchedule } from "@/hooks/use-remove-chore-schedule"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n/context"
import { AccountButton } from "@/components/account-button"
import { LanguageToggle } from "@/components/language-toggle"

export default function ManageChoresPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { address, isConnected } = useWallet()
  const { commune, isLoading: isLoadingCommune } = useCommuneData()
  const { schedules, isLoading: isLoadingSchedules, refreshSchedules } = useChoreSchedules(commune?.id || "")
  const { removeChoreSchedule, isRemoving } = useRemoveChoreSchedule(commune?.id || "")
  const { toast } = useToast()

  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)
  const [removingScheduleId, setRemovingScheduleId] = useState<string | null>(null)

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
        title: t("manageChores.accessDenied"),
        description: t("manageChores.accessDeniedDesc"),
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [commune, isCreator, router, toast, t])

  const getFrequencyLabel = (frequency: number) => {
    const days = frequency / (24 * 60 * 60)
    if (days === 1) return t("addChores.daily")
    if (days === 7) return t("addChores.weekly")
    if (days === 30) return t("addChores.monthly")
    return t("calendar.everyXDays").replace("{{days}}", days.toString())
  }

  const getFrequencyBadgeVariant = (frequency: number): "default" | "secondary" | "outline" => {
    const days = frequency / (24 * 60 * 60)
    if (days === 1) return "default"
    if (days === 7) return "secondary"
    if (days === 30) return "outline"
    return "outline"
  }

  const handleDeleteClick = (scheduleId: string) => {
    setScheduleToDelete(scheduleId)
  }

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return

    setRemovingScheduleId(scheduleToDelete)

    try {
      await removeChoreSchedule(
        scheduleToDelete,
        () => {
          toast({
            title: t("manageChores.choreRemoved"),
            description: t("manageChores.choreRemovedDesc"),
          })
          refreshSchedules()
          setScheduleToDelete(null)
          setRemovingScheduleId(null)
        },
        (error) => {
          toast({
            title: t("manageChores.failedToRemoveChore"),
            description: error.message || t("common.tryAgain"),
            variant: "destructive",
          })
          setRemovingScheduleId(null)
        }
      )
    } catch (error) {
      console.error("Failed to remove chore:", error)
      setRemovingScheduleId(null)
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
          <p className="text-charcoal/70">{t("manageChores.loading")}</p>
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
              {t("manageChores.backToDashboard")}
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">
            {t("manageChores.title")}
          </h1>
          <p className="text-charcoal/70">
            {t("manageChores.subtitle")}
          </p>
        </div>

        {/* Chore Schedules List */}
        <Card className="border-charcoal/10">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal flex items-center justify-between">
              <span>{t("manageChores.choreSchedules")}</span>
              <Badge variant="outline">{schedules.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sage" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-charcoal/60">{t("manageChores.noSchedules")}</p>
                <Link href="/dashboard/add-chores">
                  <Button className="bg-sage hover:bg-sage/90 text-cream">
                    {t("manageChores.addFirstChore")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <Card key={schedule.id} className="border-charcoal/10 bg-white/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium text-charcoal">{schedule.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getFrequencyBadgeVariant(schedule.frequency)}>
                              {getFrequencyLabel(schedule.frequency)}
                            </Badge>
                            <span className="text-xs text-charcoal/60">
                              {t("manageChores.startedOn")}: {new Date(schedule.startTime * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteClick(schedule.id)}
                          disabled={isRemoving && removingScheduleId === schedule.id}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          {isRemoving && removingScheduleId === schedule.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t("manageChores.removing")}
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("manageChores.remove")}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/dashboard">
            <Button variant="outline" className="border-charcoal/20">
              {t("manageChores.backToDashboard")}
            </Button>
          </Link>
          <Link href="/dashboard/add-chores">
            <Button className="bg-sage hover:bg-sage/90 text-cream">
              {t("manageChores.addNewChore")}
            </Button>
          </Link>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!scheduleToDelete} onOpenChange={(open) => !open && setScheduleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("manageChores.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("manageChores.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("manageChores.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
