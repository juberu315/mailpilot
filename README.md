# MailPilot AI Assistant

MailPilot AI Assistant is a modern, AI-powered email assistant that connects to your Gmail account, automatically fetches unread emails, summarizes them, classifies by category, assigns priority, and generates suggested replies. The assistant allows you to manage emails efficiently and draft responses quickly.

---

## **Features**

- **Google OAuth2 Login** – Secure login using your Google account.
- **Gmail Integration** – Fetch unread emails automatically.
- **AI Summarization** – Summarizes email content in 1-2 sentences.
- **Classification & Priority** – Categorizes emails (Work, Personal, Promotion, Notification) and assigns priority (High, Medium, Low).
- **Sentiment & Intent Analysis** – Optional AI analysis for sentiment and intent.
- **Suggested Replies** – Generates a professional draft reply.
- **Draft Management** – Create Gmail drafts directly from AI suggestions.
- **Email Dashboard** – Modern, responsive UI to view emails and analysis.
- **Up-to-date Database** – Uses PostgreSQL with Prisma ORM to store emails and analyses.

---

## **Tech Stack**

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS + ShadCN components  
- **Backend:** Next.js API Routes / Node.js + OpenAI API  
- **Database:** PostgreSQL + Prisma ORM  
- **Authentication:** Google OAuth2 via NextAuth.js  
- **AI:** OpenAI GPT-5.4-mini for summarization and classification  

---

## **Getting Started**

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mailpilot-ai-assistant.git
cd mailpilot-ai-assistant