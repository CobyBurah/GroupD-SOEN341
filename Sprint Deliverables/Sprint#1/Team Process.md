# Team Process 

## 1. Our Workflow

Every task completed including both code and documentation, follows thee following steps:

1. We create an issue for every user story or task, and we assign it to someone with a priority and labels.
2. We move the task to 'In Progress' on our project board when we start working on it.
3. We work on separate branch instead of directly in the main.
4. We Open a Pull Request when the work is finished. 
5. A teammate reviews it before it gets added to the main.
6. We merge the Pull Request once it's approved
7. We then close the issue and move the task to done.

Our project board contains 4 columns: 
**Backlog - In Progress - In Review - Done**

## 2. Our Branching Strategy

- `main` is our working version of the project, so nobody works on it directly.
- Each feature or task gets its own branch made from the most recent version of `main`.
- We name branches after the feature or task they're for, so it's easy to tell what each branch is about (example `supabase-login` or `profile-management`).
- Each issue gets its own branch, made from the most recent version of `main`.
- Once a branch is merged, we delete it to keep the repository clean.

## 3. Pull Request Process

Before opening a Pull Request, we make sure the following:
- Our branch is up to date with `main`
- The app runs on our computer (`npm run dev`) without any errors

When we open a Pull Request we add:
- A clear title, like `[#6] Implement user login`
- A short explanation of what we chaged and how to test it
- Then `Closes #issues-number`, so the issue closes right away when the Pull Request is merged

We ask at least one teammate to review it. After it is approved, the person who made the Oull Request merges it and deletes that branch.

## 4. Code Review Process

The reviewer checks that:

- It does what the issue asked for
- The app still runs without any errors
- The code is easy to read and understand
- There are no passwords or unidentified keys that we included (`.env.local` is never committed)
- Any code or help that was made or generated through AI is throughly chekced, tested and understood 

If everything looks good, we approve it. If something needs fixing, we leave a comment explaining what needs to be changed or reviewed. We try to review Pull Requests within 2 days so nobody gets stuck waiting and would be the fastest way to progress the code task without cramming.

## 5. Definition of Ready (DoR)

We only start working on an issue when: 

- It has a clear Title and description 
- User stories are written as: "As a 'user', I want 'goal' so that 'benefit'"
- It has to have acceptance criteria so that we know when it's finished
- It has priority and labeled
- Someone is properly assigned to it 
- It is reasonable enough to finish within the sprint deadline

## 6. Definition of Done (DoD)

We as a team consider an issue Done when the following are concluded:

- All acceptance criteria are met
- The work was merged into `main` through an approved Pull Request
- All implemented Features are tested and works without any errors
- Any documentation that was related has been updated to date
- Any use of AI documentation or code must be log in the AI_logs 
- The issue is then closed and put in the Done column

## 7. Communication

- We meet as a team at least once a week and if need be 2 times a week. All meetings are logged in the meeting minutes which are saved in `Meeting_Minutes/`.
- We also meet weekly with the TA during our lab section.
- If someone can't make it to a meeting, they let the team or a team member head of time
- If someone is stuck or has a problem, they share it in our group chat on Whats app or comment on the issue.


## 8. AI Usage

- We are limitely permitted to use AI tools to help with the planning, documentation, coding testing and debugging
- We must always review, discuss and check anything AI give us before using it.
- Each of us must put a record or history conversation of any AI usage in our own folder in `AI_Log/`.
