'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES, JOB_CATEGORIES, EMPTY_JOB, JOB_LIMITS, type JobValues } from '@/lib/job-posting'
import { saveJob, type JobState } from './actions'
import { LocationAutocomplete } from './location-autocomplete'
import styles from '@/app/ui.module.css'

export function JobForm({ id = null, initialValues = EMPTY_JOB }: { id?: string | null; initialValues?: JobValues }) {
  const [state, action, pending] = useActionState(saveJob.bind(null, id), { values: initialValues } as JobState)
  const values = state.values ?? initialValues

  return <form action={action} className={styles.form} key={JSON.stringify(values)} noValidate>
    <p>Job title, company, and description are required.</p>
    {state.message && <p role="alert">{state.message}</p>}

    <div>
      <label htmlFor="title">Job title *</label>
      <input id="title" name="title" defaultValue={values.title} maxLength={JOB_LIMITS.title} required aria-invalid={!!state.errors?.title} aria-describedby={state.errors?.title ? 'title-error' : undefined} />
      {state.errors?.title && <p id="title-error" role="alert">{state.errors.title}</p>}
    </div>

    <div>
      <label htmlFor="company">Company *</label>
      <input id="company" name="company" defaultValue={values.company} maxLength={JOB_LIMITS.company} required aria-invalid={!!state.errors?.company} aria-describedby={state.errors?.company ? 'company-error' : undefined} />
      {state.errors?.company && <p id="company-error" role="alert">{state.errors.company}</p>}
    </div>

    <div>
      <label htmlFor="workplace_type">Workplace</label>
      <select id="workplace_type" name="workplace_type" defaultValue={values.workplace_type} aria-invalid={!!state.errors?.workplace_type} aria-describedby={state.errors?.workplace_type ? 'workplace-error' : undefined}>
        <option value="">Not specified</option>
        {Object.entries(WORKPLACE_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {state.errors?.workplace_type && <p id="workplace-error" role="alert">{state.errors.workplace_type}</p>}
    </div>

    <div>
      <label htmlFor="location_search">Location</label>
      <LocationAutocomplete initialLocation={values.location} initialCity={values.location_city} initialRegion={values.location_region} initialCountry={values.location_country} invalid={!!state.errors?.location} />
      {state.errors?.location && <p id="location-error" role="alert">{state.errors.location}</p>}
    </div>

    <div>
      <label htmlFor="category">Category</label>
      <select id="category" name="category" defaultValue={values.category} aria-invalid={!!state.errors?.category} aria-describedby={state.errors?.category ? 'category-error' : undefined}>
        <option value="">Not specified</option>
        {JOB_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
      {state.errors?.category && <p id="category-error" role="alert">{state.errors.category}</p>}
    </div>

    <div>
      <label htmlFor="employment_type">Employment type</label>
      <select id="employment_type" name="employment_type" defaultValue={values.employment_type} aria-invalid={!!state.errors?.employment_type} aria-describedby={state.errors?.employment_type ? 'employment-error' : undefined}>
        <option value="">Not specified</option>
        {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {state.errors?.employment_type && <p id="employment-error" role="alert">{state.errors.employment_type}</p>}
    </div>

    <div>
      <label htmlFor="salary">Salary</label>
      <input id="salary" name="salary" defaultValue={values.salary} maxLength={JOB_LIMITS.salary} aria-invalid={!!state.errors?.salary} aria-describedby={state.errors?.salary ? 'salary-error' : undefined} />
      {state.errors?.salary && <p id="salary-error" role="alert">{state.errors.salary}</p>}
    </div>

    <div>
      <label htmlFor="description">Job description *</label>
      <textarea id="description" name="description" rows={10} defaultValue={values.description} maxLength={JOB_LIMITS.description} required aria-invalid={!!state.errors?.description} aria-describedby={state.errors?.description ? 'description-error' : undefined} />
      {state.errors?.description && <p id="description-error" role="alert">{state.errors.description}</p>}
    </div>

    <div className={styles.actions}>
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : id ? 'Save changes' : 'Publish posting'}</button>
      <Link className={styles.secondary} href="/recruiter">Cancel</Link>
    </div>
  </form>
}