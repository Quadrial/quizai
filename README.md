# QuizAI - AI-Powered Quiz Generator

A React + Local Storage web application that generates AI-powered quizzes from study materials using Gemini AI.

## Features

- **No Backend Required**: All data stored locally in browser
- **Optional User Accounts**: Create accounts for better organization
- **Guest Mode**: Try the app immediately without signing up
- **Multiple Input Types**: Upload PDFs, paste text, or add web links
- **AI Quiz Generation**: Powered by Google's Gemini AI
- **Guest-to-User Migration**: Transfer guest data to permanent account
- **Quiz Management**: Save, view, and retake quizzes
- **Progress Tracking**: Track quiz attempts and scores

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Storage**: Browser LocalStorage
- **AI**: Google Gemini AI
- **Routing**: React Router v7

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd quizai
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and add your Gemini AI API key:

```bash
cp .env.example .env
```

Required environment variable:
- `VITE_GEMINI_API_KEY`: Your Google Gemini AI API key

### 3. Get Gemini AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key to your `.env` file

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Guest Mode**: Click "Try as Guest" to start immediately
2. **Create Account**: Sign up to organize your data better
3. **Add Materials**: Upload PDFs, paste text, or add URLs
4. **Generate Quiz**: Select material and choose question count
5. **Take Quiz**: Answer questions and see results
6. **Track Progress**: View all quizzes and attempts in dashboard

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # Business logic services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Data Storage

- **Local Storage**: All user data stored in browser localStorage
- **No Backend**: No server or database required
- **Data Persistence**: Data persists across browser sessions
- **Account Migration**: Guest data can be transferred to user accounts

## Development Notes

- The app currently uses mock data for AI generation (see `quizService.ts`)
- PDF and URL content extraction are placeholders
- All authentication is handled locally
- Data is organized by user ID for multi-user support

## Deployment

The app can be deployed to any static hosting service:
- **Vercel**: `npm run build` then deploy `dist` folder
- **Netlify**: Connect repository and deploy
- **GitHub Pages**: Build and deploy `dist` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details