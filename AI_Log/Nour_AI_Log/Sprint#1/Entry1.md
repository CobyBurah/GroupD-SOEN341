<li> Task Title: Readme file </li>
<li> Purpose of AI Use: Detailed explanation for the setup, to make sure nothing was missing. </li>

<li> Prompt: based on our current repository, give an improved version of the setup instructions. also include a guide to run locally. </li>
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

<li> Validation: Analyzed answer thoroughly and tested it to ensure it was accurate. </li>
<li> Decision: Mostly accepted </li>
<li>Reflection: AI helped fill in details that were missing such as prerequisites and specific commands, some wording was removed.</li>
