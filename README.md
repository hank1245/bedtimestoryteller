# Bedtime Storyteller

A personalized bedtime story generator with AI-powered text-to-speech functionality. Create custom stories for children based on their age, interests, and preferred style, then listen to them with high-quality voice synthesis.

## Features

- **AI Story Generation**: Powered by Claude API for creative, age-appropriate bedtime stories
- **Text-to-Speech**: High-quality voice synthesis using OpenAI's GPT-4o-mini-TTS
- **Voice Selection**: Multiple voice options (Coral, Onyx)
- **Story Customization**: Personalize by age, gender, interests, style, and moral lessons
- **Audio Storage**: Generated audio is saved for repeated listening
- **User Authentication**: Secure login with Clerk
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
storyteller/
├── backend/          # Node.js/Express API server
│   ├── index.js      # Main server file
│   ├── db.js         # SQLite database configuration
│   ├── clerkAuth.js  # Authentication middleware
│   └── uploads/      # Audio file storage
└── frontend/         # React frontend application
    └── src/
        ├── components/   # Reusable UI components
        ├── hooks/       # Custom React hooks
        ├── pages/       # Main application pages
        ├── services/    # API integration services
        └── stores/      # State management
```

## Required API Keys

This application requires the following API keys to function properly:

### 1. OpenAI API Key (Required for TTS)

- **Purpose**: Text-to-speech generation using GPT-4o-mini-TTS
- **Where to get**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Environment variable**: `VITE_OPENAI_API_KEY`
- **Usage**: Converting generated stories to audio

### 2. Anthropic Claude API Key (Required for Story Generation)

- **Purpose**: AI-powered story generation
- **Where to get**: [Anthropic Console](https://console.anthropic.com/)
- **Environment variable**: `VITE_ANTHROPIC_API_KEY`
- **Usage**: Creating personalized bedtime stories

### 3. Clerk Authentication Keys (Required for User Management)

- **Purpose**: User authentication and session management
- **Where to get**: [Clerk Dashboard](https://clerk.com/)
- **Environment variables**:
  - `VITE_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY` (backend only)
- **Usage**: User login, registration, and session management

## Quick Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd storyteller
   ```

2. **Set up environment variables**

   Create `.env` files in both frontend and backend directories:

   **Frontend (.env)**:

   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   VITE_API_BASE_URL=http://localhost:4000
   ```

   **Backend (.env)**:

   ```
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   PORT=4000
   ```

3. **Install dependencies and start services**

   **Backend**:

   ```bash
   cd backend
   npm install
   npm start
   ```

   **Frontend** (in a new terminal):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## Cost Considerations

- **OpenAI TTS**: GPT-4o-mini-TTS is more cost-effective than previous TTS models
- **Claude API**: Pay-per-token pricing for story generation
- **Clerk**: Free tier available for basic authentication needs

## Development

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + SQLite
- **Styling**: Styled Components
- **Authentication**: Clerk
- **Database**: SQLite (local file-based)
