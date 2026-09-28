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
