//Filters for the recruiter's Applications for job page
//Filters are in the URL 

import { isApplicationStatus, type ApplicationStatus } from '@/lib/applications'

export type ApplicationFilters = { status: ApplicationStatus | null
    from: string | null
    to: string | null
}

export type ApplicationFilterParams = {
    status?: string | string[]
    from?: string | string[]
    to?: string | string[]
}

// A URL can repeat a value, Next.js may give us an array, we just use the first 1
function firstValue(value: string | string[] | undefined){
    if(Array.isArray(value)){
        return value[0]
    }
    return value
}

//Checks that the text is a real date written like 2026-11-13

export function isDateInput(value: string | undefined){
    if(!value){
        return false
    }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){
        return false
    }
    const date = new Date(value)
    if (isNaN(date.getTime())){
        return false
    }
    //fags the fake dates 
    return date.toISOString().slice(0,10) === value

}

//Reads the filters from the URL, if invalid it will ignore it
export function parseApplicationFilters(params: ApplicationFilterParams): ApplicationFilters {
    const status = firstValue(params.status)
    let from = firstValue(params.from)
    let to = firstValue(params.to)

    if(!isDateInput(from)){
        from = undefined
    }
    if(!isDateInput(to)){
        to = undefined
    }

    if(from && to && from > to){
        const temp = from
        from = to 
        to = temp
    }
    return {
        status: isApplicationStatus(status) ? status : null,
        from: from || null,
        to: to || null,

    }
}

//true if at least one filter is being used 
export function hasActiveFilters(filters: ApplicationFilters) {
    return filters.status !== null || filters.from !== null || filters.to !== null
}

//gets the day an application was sent like "2026-11-13"
export function applicationDate(createdAt: string){
    return new Date(createdAt).toISOString().slice(0,10)

}

//keep only the applications that match the filters using <T>
export function filterApplications<T extends {
    status: string; created_at: string} > (applications: T[], filters: ApplicationFilters): T[]{
    return applications.filter(application => {
        if(filters.status && application.status !== filters.status){
            return false
        }
        const day = applicationDate(application.created_at)
        if(filters.from && day < filters.from){
            return false
        }
        if(filters.to && day > filters.to){
            return false
        }

        return true

    })
}