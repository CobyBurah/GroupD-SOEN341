const seekerId = '00000000-0000-0000-0000-000000000003'
const otherSeekerId = '00000000-0000-0000-0000-000000000004'

function notice(index, message, { read = false, kind = 'application_status', userId = seekerId } = {}) {
  const createdAt = new Date(Date.UTC(2026, 10, 1, 0, index)).toISOString()
  return {
    id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
    user_id: userId,
    kind,
    message,
    href: '/applications',
    created_at: createdAt,
    read_at: read ? createdAt : null,
  }
}

// The 201 newer read notices put every unread alert outside the default inbox window.
export function unreadInboxSeed() {
  const older = Array.from({ length: 21 }, (_, i) => notice(i, `Application update for posting ${i}.`))
  older[0] = notice(0, 'Interview invitation for Product Designer.', { kind: 'interview' })
  older[19] = notice(19, 'Your application for Data Analyst is under review.')
  older[20] = notice(20, 'Interview invitation for QA Engineer.', { kind: 'interview' })
  const recent = Array.from({ length: 201 }, (_, i) => notice(21 + i, `Reviewed update ${i + 1}.`, { read: true }))
  return [
    ...older,
    ...recent,
    notice(300, 'Another seeker’s private update.', { userId: otherSeekerId }),
  ]
}
