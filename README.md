🧠 Retentia — AI-Powered Study & Learning Platform

Retentia is an intelligent, minimalist study web app that transforms any text into interactive learning material using AI-generated summaries and questions.
Built with Next.js 14, TypeScript, Supabase, and OpenAI, it’s designed to help students and professionals understand, recall, and retain information faster — powered by elegant design and smart automation.

🌐 Live App: https://retentia.app

⸻

✨ Features

🧠 AI Study Modes
	•	Study Mode – Generate structured key points and summaries from your text input.
	•	Explain Mode – Retentia acts as a tutor, simplifying complex text into clear explanations.
	•	Summarize Mode – Condense long text into short, actionable insights.

💬 Text-Based AI Generation
	•	Paste any text or notes directly – no file uploads or YouTube links needed.
	•	AI automatically generates meaningful learning material in seconds.
	•	Supports multiple subjects and writing styles.

🌍 Multilingual Interface
	•	Fully localized UI using Next-Intl.
	•	Available in English, Slovak, Czech, Spanish, German, Portuguese, and Italian.
	•	Automatically loads language based on user preference or browser locale.

🎨 Clean, Modern Design
	•	Responsive and minimalistic UI built with TailwindCSS.
	•	Focus-first experience – no distractions, just learning.
	•	Smooth modals, animations, and intuitive user flow.

⸻

🏗️ Tech Stack

Frontend: Next.js 14 (App Router), React, TypeScript
Styling: TailwindCSS, Framer Motion
AI Engine: GroqAI API (text summarization and question generation)
Deployment: Vercel
Localization: next-intl

⸻

⚙️ Getting Started

Prerequisites
	•	Node.js 18+
	•	GroqAI API key
	•	Vercel account for deployment

Installation
	1.	Clone the repository
git clone https://github.com/yourusername/retentia.git
cd retentia
	2.	Install dependencies
npm install or pnpm install
	3.	Configure environment variables
Create a .env.local file and add the following keys:
OPENAI_API_KEY
NEXT_PUBLIC_SITE_URL=https://retentia.app
	4.	Run locally
npm run dev or pnpm dev
Then open http://localhost:3000 in your browser.

⸻

🧩 Project Structure

retentia/
├── app/ – Next.js App Router pages
│   ├── [locale]/ – Localized routes
│   ├── api/ – API routes for AI generation, etc.
│   ├── layout.tsx – Root layout
│   └── page.tsx – Main landing page
├── components/ – Reusable UI components (inputs, modals, etc.)
├── lib/ –  AI utilities, and i18n configuration
├── locales/ – Translation files
├── public/ – Static assets such as logos and icons
├── styles/ – Global CSS styles
└── utils/ – Helper functions

⸻

🔧 API Endpoints

/api/generate – Generates AI questions and summaries from text input.
Method: POST
Body: { mode: “study” | “explain” | “summarize”, text: “Your text” }
Response: { success: true, data: { questions: […], summary: “…” } }

/api/verify-session – Verifies Supabase user session.
/api/verify-purchase – Validates premium plan access for users.

⸻

🧠 Core Functionality Overview

AI Text Generation – Converts text into summaries, key insights, or Q&A.
User Authentication – Email/password login and persistent sessions via Supabase.
Language Support – All text and modals are fully translatable.
Responsive UI – Works across mobile and desktop.
Secure API Routes – Protected via Supabase and environment validation.

⸻

🚀 Deployment

The app is ready for Vercel deployment.
	1.	Push your code to GitHub.
	2.	Connect your repository to Vercel.
	3.	Add your .env variables to the Vercel dashboard.
	4.	Deploy – automatic build and live updates on push to main.

⸻

💡 Roadmap
	•	Add AI-generated flashcards export.
	•	Integrate text-to-speech summaries.
	•	Add user progress tracking dashboard.
	•	Introduce note collections and folders.
	•	Expand AI explanation depth and reasoning.

⸻

🧑‍💻 Contributing

Contributions and feedback are welcome.
	1.	Fork the repository.
	2.	Create a feature branch.
	3.	Commit your changes.
	4.	Push to your branch.
	5.	Open a pull request.

⸻

📜 License

This project is licensed under the MIT License – see the LICENSE file for details.

⸻

💬 Credits

Developed by Nikolas Pastier
Built with Next.js and GroqAI.

⸻

🌟 If you like this project

Give it a star on GitHub and share it with fellow learners.
