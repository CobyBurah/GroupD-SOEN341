import { NotificationInbox } from './notification-inbox'

export default async function NotificationsPage({ searchParams }: {
  searchParams: Promise<{ filter?: string | string[] }>
}) {
  const filter = (await searchParams).filter === 'unread' ? 'unread' : 'all'
  return <NotificationInbox key={filter} filter={filter} />
}
