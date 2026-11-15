export type Notification = {
  id: string
  kind: 'application_status' | 'interview' | 'new_application' | 'deadline'
  message: string
  href: string
  created_at: string
  read_at: string | null
}

export type InboxFilter = 'all' | 'unread'

export type NotificationFeed = { notifications: Notification[]; unread: number; hasMore: boolean }

export function notificationHref(href: string) {
  // Never turn stored data into an external navigation target.
  return /^\/(applications(?:\?|$)|jobs\/[\da-f-]+$|recruiter\/jobs\/[\da-f-]+\/applications$)/i.test(href)
    ? href : '/notifications'
}
