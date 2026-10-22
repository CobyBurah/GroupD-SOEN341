export const EMPLOYMENT_TYPES = {
  full_time: 'Full time', part_time: 'Part time', contract: 'Contract', internship: 'Internship',
} as const

export const JOB_CATEGORIES = [
  'Accounting',
  'Administration',
  'Business Development',
  'Communications & Public Relations',
  'Consulting',
  'Customer Service',
  'Cybersecurity',
  'Data & Analytics',
  'Design & UX/UI',
  'Education',
  'Engineering',
  'Finance',
  'Government & Public Service',
  'Healthcare',
  'Hospitality & Tourism',
  'Human Resources',
  'IT & Infrastructure',
  'Legal',
  'Marketing',
  'Operations',
  'Product Management',
  'Project Management',
  'Quality Assurance',
  'Research',
  'Retail',
  'Sales',
  'Software Development',
  'Supply Chain & Logistics',
  'Other',
] as const

export const JOB_LIMITS = {
  title: 150, company: 150, location: 150, location_city: 100, location_region: 100, location_country: 100, category: 100, salary: 100, description: 15000,
} as const

export type JobValues = Record<keyof typeof JOB_LIMITS | 'employment_type', string>
export type JobErrors = Partial<Record<keyof JobValues, string>>

export const EMPTY_JOB: JobValues = {
  title: '', company: '', location: '', location_city: '', location_region: '', location_country: '', category: '', employment_type: '', salary: '', description: '',
}

export function validateJob(formData: FormData) {
  const values = { ...EMPTY_JOB }
  const errors: JobErrors = {}

  for (const field of Object.keys(values) as (keyof JobValues)[]) {
    const raw = formData.get(field)
    values[field] = typeof raw === 'string' ? raw.trim() : ''
    if (raw !== null && typeof raw !== 'string') errors[field] = 'Enter text for this field.'
  }

  for (const field of ['title', 'company', 'location', 'description'] as const) {
    if (!values[field]) errors[field] = 'This field is required.'
  }

  const locationSearch = formData.get('location_search')
  const typedLocation = typeof locationSearch === 'string' ? locationSearch.trim() : ''

  if (!values.location && typedLocation) {
  errors.location = 'Choose a location from the suggestions.'
  }

  for (const field of Object.keys(JOB_LIMITS) as (keyof typeof JOB_LIMITS)[]) {
    if (values[field].length > JOB_LIMITS[field]) {
      errors[field] = `Use ${JOB_LIMITS[field]} characters or fewer.`
    }
  }

  if (values.employment_type && !Object.hasOwn(EMPLOYMENT_TYPES, values.employment_type)) {
    errors.employment_type = 'Choose a listed employment type.'
  }

  // Category is optional, but if one is selected it has to be from the category list
  if (values.category && !JOB_CATEGORIES.includes(values.category as typeof JOB_CATEGORIES[number])) {
    errors.category = 'Choose a listed category.'
  }

  // Location has to be Remote or a city selected from the location suggestions
  if (values.location && values.location !== 'Remote' && (!values.location_city || !values.location_country) ) {
  errors.location = 'Choose a location from the suggestions.'
}

  return { values, errors, valid: Object.keys(errors).length === 0 }
}

export function isJobId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}