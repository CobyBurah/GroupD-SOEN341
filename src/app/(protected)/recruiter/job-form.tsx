'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { EMPLOYMENT_TYPES, JOB_CATEGORIES, EMPTY_JOB, JOB_LIMITS, type JobValues } from '@/lib/job-posting'
import { saveJob, type JobState } from './actions'
import { LocationAutocomplete } from './location-autocomplete'
import styles from '@/app/ui.module.css'

const labels = { title: 'Job title', company: 'Company', location: 'Location', salary: 'Salary', description: 'Job description' }

export function JobForm({ id = null, initialValues = EMPTY_JOB }: { id?: string | null; initialValues?: JobValues }) {
  const [state, action, pending] = useActionState(saveJob.bind(null, id), { values: initialValues } as JobState)
  const values = state.values ?? initialValues

  return <form action={action} className={styles.form} key={JSON.stringify(values)} noValidate>
    <p>Job title, company, location, and description are required.</p>
    {state.message && <p role="alert">{state.message}</p>}

    {(Object.keys(labels) as (keyof typeof labels)[]).map(field => <div key={field}>
      <label htmlFor={field === 'location' ? 'location_search' : field}>{labels[field]}{['title', 'company', 'location', 'description'].includes(field) ? ' *' : ''}</label>
      {field === 'description'
        ? <textarea id={field} name={field} rows={10} defaultValue={values[field]} maxLength={JOB_LIMITS[field]} required aria-invalid={!!state.errors?.[field]} aria-describedby={state.errors?.[field] ? `${field}-error` : undefined} />
        : field === 'location'
          ? <LocationAutocomplete initialLocation={values.location} initialCity={values.location_city} initialRegion={values.location_region} initialCountry={values.location_country} invalid={!!state.errors?.location} />
          : <input id={field} name={field} defaultValue={values[field]} maxLength={JOB_LIMITS[field]} required={field === 'title' || field === 'company'} aria-invalid={!!state.errors?.[field]} aria-describedby={state.errors?.[field] ? `${field}-error` : undefined} />}
      {state.errors?.[field] && <p id={`${field}-error`} role="alert">{state.errors[field]}</p>}
    </div>)}

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

    <div className={styles.actions}>
      <button type="submit" disabled={pending}>{pending ? 'Saving…' : id ? 'Save changes' : 'Publish posting'}</button>
      <Link className={styles.secondary} href="/recruiter">Cancel</Link>
    </div>
  </form>
}