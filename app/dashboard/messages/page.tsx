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
import { useMessages, usePostMessage, useReplyToMessage, useEditMessage, useDeleteMessage, usePinMessage } from "@/hooks/use-message-board"
import { useWallet } from "@/hooks/use-wallet"
import { Loader2, Plus, MessageSquare, Reply, Edit, Trash2, Pin, ArrowLeft, Clock, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function MessagesPage() {
  const { t } = useI18n()
  const { address, isConnected } = useWallet()
  const { commune, members, isLoading: communeLoading } = useCommuneData()
  const { messages, pinnedMessages, isLoading: messagesLoading, refreshMessages } = useMessages(commune?.id)
  
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  
  const [newMessage, setNewMessage] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [editContent, setEditContent] = useState("")
  
  const { postMessage, isPending: posting } = usePostMessage()
  const { replyToMessage, isPending: replying } = useReplyToMessage()
  const { editMessage, isPending: editing } = useEditMessage()
  const { deleteMessage, isPending: deleting } = useDeleteMessage()
  const { pinMessage, isPending: pinning } = usePinMessage()

  const handlePostMessage = () => {
    if (!commune || !newMessage.trim()) {
      toast.error("Please enter a message")
      return
    }

    postMessage(commune.id, newMessage.trim())
    setNewMessage("")
    setNewMessageOpen(false)
    
    setTimeout(() => {
      refreshMessages()
    }, 3000)
  }

  const handleReply = () => {
    if (!commune || !replyToId || !replyContent.trim()) {
      toast.error("Please enter a reply")
      return
    }

    replyToMessage(commune.id, replyToId, replyContent.trim())
    setReplyContent("")
    setReplyOpen(false)
    setReplyToId(null)
    
    setTimeout(() => {
      refreshMessages()
    }, 3000)
  }

  const handleEdit = () => {
    if (!commune || !selectedMessageId || !editContent.trim()) {
      toast.error("Please enter message content")
      return
    }

    editMessage(commune.id, selectedMessageId, editContent.trim())
    setEditContent("")
    setEditOpen(false)
    setSelectedMessageId(null)
    
    setTimeout(() => {
      refreshMessages()
    }, 3000)
  }

  const handleDelete = (messageId: string) => {
    if (!commune) return
    
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage(commune.id, messageId)
      
      setTimeout(() => {
        refreshMessages()
      }, 3000)
    }
  }

  const handlePin = (messageId: string) => {
    if (!commune) return
    
    pinMessage(commune.id, messageId)
    
    setTimeout(() => {
      refreshMessages()
    }, 3000)
  }

  const openReplyDialog = (messageId: string) => {
    setReplyToId(messageId)
    setReplyOpen(true)
  }

  const openEditDialog = (message: any) => {
    setSelectedMessageId(message.id)
    setEditContent(message.content)
    setEditOpen(true)
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getUsernameByAddress = (address: string) => {
    const member = members.find(m => m.address.toLowerCase() === address.toLowerCase())
    return member?.username || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const organizeMessages = () => {
    const messageMap = new Map()
    const rootMessages: any[] = []
    
    // First pass: create map of all messages
    messages.forEach(msg => {
      messageMap.set(msg.id, { ...msg, replies: [] })
    })
    
    // Second pass: organize into threads
    messages.forEach(msg => {
      if (msg.parentId) {
        const parent = messageMap.get(msg.parentId)
        if (parent) {
          parent.replies.push(messageMap.get(msg.id))
        }
      } else {
        rootMessages.push(messageMap.get(msg.id))
      }
    })
    
    // Sort by timestamp (newest first)
    rootMessages.sort((a, b) => b.timestamp - a.timestamp)
    
    return rootMessages
  }

  const isMessageAuthor = (messageAuthor: string) => {
    return messageAuthor.toLowerCase() === address?.toLowerCase()
  }

  const canEdit = (message: any) => {
    const fifteenMinutes = 15 * 60 * 1000
    const now = Date.now()
    const messageTime = message.timestamp * 1000
    
    return isMessageAuthor(message.author) && (now - messageTime) < fifteenMinutes
  }

  const renderMessage = (message: any, isReply = false) => (
    <Card key={message.id} className={`${isReply ? 'ml-8 mt-2' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-charcoal/70">
              <User className="w-4 h-4" />
              {getUsernameByAddress(message.author)}
            </div>
            <div className="flex items-center gap-1 text-sm text-charcoal/50">
              <Clock className="w-3 h-3" />
              {formatDateTime(message.timestamp)}
            </div>
            {message.isPinned && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isReply && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => openReplyDialog(message.id)}
                className="h-8 w-8 p-0"
              >
                <Reply className="w-3 h-3" />
              </Button>
            )}
            
            {canEdit(message) && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => openEditDialog(message)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
            
            {isMessageAuthor(message.author) && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleDelete(message.id)}
                disabled={deleting}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
            
            {!isReply && commune?.creator.toLowerCase() === address?.toLowerCase() && !message.isPinned && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handlePin(message.id)}
                disabled={pinning}
                className="h-8 w-8 p-0"
              >
                <Pin className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="text-charcoal whitespace-pre-wrap">
          {message.content}
        </div>
        
        {message.replies && message.replies.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.replies.map((reply: any) => renderMessage(reply, true))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-cream flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-charcoal">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-charcoal/70 mb-4">Please connect your wallet to view messages.</p>
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

  const organizedMessages = organizeMessages()

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
            <div className="text-2xl font-serif">Message Board</div>
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
              Message Board
            </h1>
            <p className="text-charcoal/70">Communicate with your commune members</p>
          </div>

          <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sage hover:bg-sage/90 text-cream">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Post New Message</DialogTitle>
                <DialogDescription>
                  Share an announcement or start a discussion.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label htmlFor="newMessage">Message</Label>
                <Textarea
                  id="newMessage"
                  placeholder="What would you like to share?"
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewMessageOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePostMessage} disabled={posting}>
                  {posting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Post Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-serif text-charcoal mb-4">📌 Pinned Messages</h2>
            <div className="space-y-4">
              {pinnedMessages.map(message => renderMessage(message))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messagesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sage" />
          </div>
        ) : (
          <div className="space-y-4">
            {organizedMessages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-16 h-16 text-charcoal/30 mx-auto mb-4" />
                  <h3 className="text-xl font-serif text-charcoal mb-2">No messages yet</h3>
                  <p className="text-charcoal/70 mb-4">Start a conversation with your commune members.</p>
                  <Button onClick={() => setNewMessageOpen(true)} className="bg-sage hover:bg-sage/90 text-cream">
                    <Plus className="w-4 h-4 mr-2" />
                    Post First Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div>
                <h2 className="text-xl font-serif text-charcoal mb-4">Recent Messages</h2>
                {organizedMessages.map(message => renderMessage(message))}
              </div>
            )}
          </div>
        )}

        {/* Reply Dialog */}
        <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Reply to Message</DialogTitle>
              <DialogDescription>
                Post a reply to this message thread.
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="replyContent">Reply</Label>
              <Textarea
                id="replyContent"
                placeholder="Write your reply..."
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={replying}>
                {replying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Post Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Edit Message</DialogTitle>
              <DialogDescription>
                You have 15 minutes to edit a message after posting.
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="editContent">Message</Label>
              <Textarea
                id="editContent"
                placeholder="Edit your message..."
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={editing}>
                {editing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}