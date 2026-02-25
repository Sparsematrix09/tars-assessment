A modern, real-time chat application built for the Tars assessment. This project focuses on delivering a seamless messaging experience with secure authentication, instant real-time database syncing, and a clean, responsive UI.
**[View Live Demo]([YOUR_VERCEL_URL_HERE](https://tars-assessment.vercel.app/))**

## Features

* **Real-time Messaging:** Messages appear instantly across all devices without needing to refresh, powered by Convex.
* **Secure Authentication:** User login and registration handled safely and seamlessly via Clerk.
* **Modern UI:** Built with Next.js and styled for a clean, intuitive user experience.
* **Fully Cloud-Synced:** User profiles and chat histories are securely stored and synced in the cloud.

## Built With
* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Backend & Database:** [Convex](https://www.convex.dev/) (Real-time syncing)
* **Authentication:** [Clerk](https://clerk.com/)
* **Deployment:** [Vercel](https://vercel.com/)

---

## Getting Started Locally
Want to run this project on your own machine? It's super easy.
### 1. Clone the repository
```bash
git clone [https://github.com/Sparsematrix09/tars-assessment.git](https://github.com/Sparsematrix09/tars-assessment.git)
cd tars-assessment

Install dependencies
npm install

Set up your environment variables
You will need your own Clerk and Convex accounts to run this locally. Create a .env.local file in the root directory and add the following keys:

# Clerk Auth Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Database URL
NEXT_PUBLIC_CONVEX_URL=your_convex_url

Start the backend
npx convex dev

Start the frontend
npm run dev
with thia app runs loclally at http://localhost:3000
