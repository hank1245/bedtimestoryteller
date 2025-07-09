# Bedtime Storyteller Frontend

This is the frontend for the Bedtime Storyteller application, built with React, TypeScript, and Vite.

## Features

- **Story Generation**: Create personalized bedtime stories
- **Story Reading**: View and read saved stories
- **Text-to-Speech**: Listen to stories with OpenAI TTS voices
- **Font Size Control**: Adjust text size for comfortable reading
- **Voice Selection**: Choose between multiple OpenAI voices
- **Audio Controls**: Play, pause, stop, and restart audio playback

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env` file in the root directory and add:

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

## Audio Features

The app includes text-to-speech functionality powered by OpenAI TTS:

- **Voice Selection**: Choose between multiple OpenAI voices (Coral, Onyx)
- **Audio Generation**: Stories are converted to speech on demand using GPT-4o-mini-TTS
- **Playback Controls**: Standard audio controls (play/pause/stop/restart)
- **Loading States**: Visual feedback during audio generation

## Tech Stack

- React 19
- TypeScript
- Styled Components
- Vite
- OpenAI TTS (GPT-4o-mini-TTS)
- Clerk Authentication
