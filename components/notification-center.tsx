"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Check, CheckCheck, Trash2, X } from "lucide-react"
import { useNotifications, type Notification } from "@/lib/notifications/context"
import { useI18n } from "@/lib/i18n/context"
import { motion, AnimatePresence } from "framer-motion"

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const typeColors: Record<string, string> = {
    task: "bg-blue-100 text-blue-700 border-blue-200",
    chore: "bg-green-100 text-green-700 border-green-200",
    dispute: "bg-red-100 text-red-700 border-red-200",
    info: "bg-gray-100 text-gray-700 border-gray-200",
  }

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-3 rounded-lg border ${notification.read ? "bg-white/30 opacity-60" : "bg-white/80"} cursor-pointer`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-xs ${typeColors[notification.type] || typeColors.info}`}>
              {notification.type}
            </Badge>
            {!notification.read && <span className="w-2 h-2 rounded-full bg-sage flex-shrink-0" />}
          </div>
          <p className="text-sm font-medium text-charcoal truncate">{notification.title}</p>
          <p className="text-xs text-charcoal/60 truncate">{notification.message}</p>
        </div>
        <span className="text-xs text-charcoal/40 flex-shrink-0">{timeAgo(notification.timestamp)}</span>
      </div>
    </motion.div>
  )
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, requestPermission, permissionGranted } =
    useNotifications()
  const { t } = useI18n()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <Card className="border-charcoal/10 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-serif">Notifications</CardTitle>
                  <div className="flex items-center gap-1">
                    {!permissionGranted && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={requestPermission}>
                        <BellOff className="w-3 h-3 mr-1" />
                        Enable
                      </Button>
                    )}
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Read all
                      </Button>
                    )}
                    {notifications.length > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={clearAll}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7" onClick={() => setIsOpen(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-charcoal/50 text-center py-6">No notifications yet</p>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={markAsRead}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
