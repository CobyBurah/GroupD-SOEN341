<li> Task Title: Readme file </li>
<li> Purpose of AI Use: One prompt to obtain detailed explanation for the setup, to make sure nothing was missind and another to start building ideas for the generative AI feature.</li>

<li> Prompt1: based on our current repository, give an improved version of the setup instructions. also include a guide to run locally. </li>
<li> Answer:

``` bash
You could replace your current Setup Instructions with this:
# Setup Instructions

## Accessing CareerConnect

CareerConnect will be deployed online using Vercel.

To access the application:
1. Open the CareerConnect website using a modern web browser such as Google Chrome, Safari, Microsoft Edge, or Firefox.
2. Click **Register** to create an account and enter the required information.
3. Log in using the email address and password associated with the account.
4. Once logged in, users can access the available CareerConnect features.

> Deployment link: [CareerConnect Vercel URL]

## Running CareerConnect Locally

### Requirements
Before running the project locally, make sure the following are installed:
- Node.js
- npm
- Git

### Installation

1. Clone the GitHub repository:

   ```bash
   git clone https://github.com/CobyBurah/GroupD-SOEN341.git

2. Navigate into the project folder:
   cd GroupD-SOEN341
3. Install the project dependencies:
   npm install
4. Create a .env.local file in the root of the project.
   Use .env.example as a template:
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   
   Fill in the required values using the project's Supabase configuration.
5. Start the development server:
   npm run dev
6. Open the application in your browser at:
   http://localhost:3000
``` 
</li> 

<li> Prompt2: Based on the required system features and project description, give 10 generative AI feature ideas we could implement. </li>
<li> Answer:

``` bash
Here are 10 possible Generative AI features for CareerConnect:

1. AI Resume-to-Job Comparison
Analyze how well a user's resume matches the requirements of a specific job and identify missing skills or experience.

2. AI Resume Feedback
Analyze a user's resume and suggest improvements based on clarity, structure, and relevance.

3. AI Job Matching
Compare a user's profile and resume with available job postings and suggest the most relevant opportunities.

4. AI Cover Letter Generator
Generate a personalized cover letter based on the user's profile and the selected job posting.

5. AI Interview Practice
Generate interview questions based on a selected job posting so job seekers can practice before an interview.

6. AI Interview Answer Feedback
Allow users to answer interview questions and receive feedback on how clear, relevant, and complete their answers are.

7. AI Job Description Summary
Summarize long job postings into key information such as required skills, responsibilities, qualifications, and deadlines.

8. AI Skill Recommendation
Analyze recent job postings and recommend skills that a job seeker could improve or learn based on their career interests.

9. AI Profile Improvement Suggestions
Review a user's CareerConnect profile and suggest ways to make it more complete or attractive to recruiters.

10. AI Application Preparation Assistant
Help users prepare for an application by suggesting what information, documents, or skills they should highlight for a selected job.

For CareerConnect, AI Interview Practice could be a strong option because it goes beyond simply helping users find jobs and helps them prepare for the interview stage of the hiring process.
``` 
</li> 

<li> Validation: Peer review </li>
<li> Decision: Currently accepted </li>
<li>Reflection: The AI assistance was useful as it gave us many options to consider. We have decided to go with the interview practice questions set for now.</li>



<li> Task Title: Sprint 1 Work Plan – Appendix A </li>
<li> Purpose of AI Use: Used AI to summarize the information already available in our project board and organize it into the required work plan format. </li>

<li> Prompt: Create a table with the following information: Appendix A – Sprint 1 Work Plan.
Provide a Sprint 1 work plan that summarizes how your team intends to complete the Sprint 1 deliverables. The plan should be based on the issues created in your project repository and demonstrate that the required work has been identified, assigned, and scheduled.

For each planned item, include:
- Issue Number
- Issue Title
- Issue Type (User Story or Task)
- Responsible Member
- Target Completion Date
- Priority (High, Medium, Low)
- Current Status (Not Started, In Progress, Completed)

The purpose of this section is to provide a clear overview of the team's plan for Sprint 1. It should not contain detailed issue descriptions; instead, it should summarize the repository issues and show how the team has organized the work, assigned responsibilities, and planned to complete the sprint deliverables.

All information is already included on the Project Board in the repository. </li>
<li> Answer:

``` bash
## Appendix A – Sprint 1 Work Plan

| Issue # | Issue Title | Issue Type | Responsible Member | Target Completion Date | Priority | Current Status |
|---------|-------------|------------|--------------------|------------------------|----------|----------------|
| #8 | GitHub Setup & Initialization | Task | All Members | TBD | High | Completed |
| #3 | User Stories | Task | Parsa | TBD | High | Completed |
| #9 | 10 AI Generated User Stories | Task | Parsa | TBD | High | Completed |
| #13 | Team Created User Stories | Task | Unassigned | TBD | High | In Progress |
| #4 | Sprint Planning | Task | Eldar | TBD | High | Completed |
| #5 | Task Breakdown for Sprint 1 | Task | All Members | TBD | High | Completed |
| #10 | Create Supabase Project | Task | Coby | TBD | High | Completed |
| #12 | README File | Task | Sabrina & Nour | Sept. 21 | High | Completed |
| #16 | Setting Up Project Foundations | Task | Coby | TBD | High | Completed |
| #19 | Create Next.js Project in Terminal | Task | Coby | TBD | High | Completed |
| #20 | Connect Project to Supabase | Task | Coby | TBD | High | Completed |
| #6 | User Registration / Login | User Story | Coby | Sept. 27 | High | In Progress |
| #30 | Implement Basic Login Screen | Task | Coby | Sept. 27 | High | Completed |
| #32 | Implement User Creation | Task | Coby | Sept. 27 | High | Completed |
| #7 | User Profile Management | User Story | Noah | Sept. 27 | High | Completed |
| #14 | Meeting Minutes | Task | Sabrina & Nour | Sept. 27 | Medium | Completed |
| #34 | Sprint 1 Submission Document | Task | Nour | Sept. 27 | High | Completed |

``` 
</li> 

<li> Validation: Compared to our github project board and issues to make sure the table provided contained accurate information. </li>
<li> Decision: Modified before use. </li>
<li>Reflection: It helped organize the information into the format required for Appendix A. Some of the suggested dates, statuses, issue types, and included issues were adjusted afterwards to represent our team's Sprint 1 plan better. </li>
