-- Random Sample Jobs for the job listings, job details, search and filters
-- for now the jobs are atached to 1 existing account so when the recruiter is then created then they can reassign them to a real recruiter 
-- since each job needs a recruiter as it's owner

insert into public.jobs  -- add rows to the jobs table
    (recruiter_id, title, company, location, category, employment_type, salary, description, created_at)
    select 
        'b7198249-22d3-4187-8d7b-284476c8a656'::uuid, -- sample jobs are assigned to the test recruiter account
        sample_jobs.title,
        sample_jobs.company,
        sample_jobs.location,
        sample_jobs.category,
        sample_jobs.employment_type, -- full_time, part_time, contract or intership
        sample_jobs.salary,
        sample_jobs.description,
        sample_jobs.created_at::timestamptz -- '::' convert the text into date and time
    from(values -- each line is = 1 job
    ('Junior Frontend Developer', 'Northwave Labs', 'Montreal, QC', 'Software Development', 'full_time', '$55,000 - $65,000', 'Build and maintain responsive web interfaces for our SaaS analytics product. Requirements: React, JavaScript, CSS, Git.', '2026-10-10T09:15:00Z'),
    ('Backend Developer Intern', 'Maple Byte Inc.', 'Toronto, ON', 'Software Development', 'internship', '$25/hour', 'Help design REST APIs and database schemas for an internal logistics platform. Requirements: Node.js, SQL, REST APIs.', '2026-10-12T14:30:00Z'),
    ('Data Analyst', 'Clearview Insights', 'Remote', 'Data & Analytics', 'full_time', '$60,000 - $72,000', 'Build dashboards and reports from raw sales data for business stakeholders. Requirements: SQL, Python, Power BI.', '2026-10-08T11:00:00Z'),
    ('QA Automation Tester', 'Pixelforge Studios', 'Montreal, QC', 'Quality Assurance', 'contract', '$35/hour', 'Write and maintain automated test suites for a cross-platform mobile game. Requirements: Selenium, Java, CI/CD.', '2026-10-14T08:45:00Z'),
    ('UX/UI Designer', 'Bloom Health', 'Vancouver, BC', 'Design', 'full_time', '$65,000 - $80,000', 'Design intuitive patient-facing experiences for a telehealth app. Requirements: Figma, user research, prototyping.', '2026-10-05T16:20:00Z'),
    ('DevOps Engineer', 'CloudPeak Systems', 'Ottawa, ON', 'IT & Infrastructure', 'full_time', '$85,000 - $100,000', 'Manage cloud infrastructure and improve deployment pipelines across teams. Requirements: AWS, Docker, Kubernetes, Terraform.', '2026-10-11T10:10:00Z'),
    ('Marketing Coordinator', 'Lumen Retail Group', 'Montreal, QC', 'Marketing', 'part_time', '$22/hour', 'Coordinate social media campaigns and track engagement metrics. Requirements: social media, copywriting, bilingual (EN/FR).', '2026-10-13T13:00:00Z'),
    ('Full Stack Developer', 'Stackwise', 'Remote', 'Software Development', 'full_time', '$75,000 - $90,000', 'Ship end-to-end features for a project management tool used by 10k+ teams. Requirements: React, Node.js, MongoDB, TypeScript.', '2026-10-09T15:40:00Z'),
    ('IT Support Technician', 'Concordia Tech Services', 'Laval, QC', 'IT & Infrastructure', 'full_time', '$45,000 - $52,000', 'Provide hardware and software support to staff across three office locations. Requirements: Windows, networking basics, troubleshooting.', '2026-10-15T09:00:00Z'),
    ('Machine Learning Intern', 'NeuralNest AI', 'Montreal, QC', 'Data & Analytics', 'internship', '$28/hour', 'Assist in training and evaluating recommendation models. Requirements: Python, PyTorch, statistics.', '2026-10-07T12:25:00Z'),
    ('Product Manager', 'Orbit Finance', 'Toronto, ON', 'Product Management', 'full_time', '$95,000 - $115,000', 'Own the roadmap for a personal budgeting app and work closely with engineering. Requirements: Agile, roadmapping, stakeholder communication.', '2026-10-03T17:05:00Z'),
    ('Mobile Developer (iOS)', 'TrailMate', 'Calgary, AB', 'Software Development', 'contract', '$50/hour', 'Build new features for a hiking and outdoor navigation app. Requirements: Swift, SwiftUI, REST APIs.', '2026-10-14T11:50:00Z')
) as sample_jobs(title, company, location, category, employment_type, salary, description, created_at); -- names the list "sample_jobs" with its columns