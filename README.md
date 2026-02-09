# Nanoclass

NanoClass integrates multiple Gemini 3 features to turn teacher input into complete, classroom-ready animated lessons tailored for young learners. At its core, the system uses Gemini 3 for structured content generation: given a topic or curriculum-aligned template, Gemini drafts age-appropriate slide narratives, learning objectives, and simple explanations suitable for K1–P3 students. It also generates supporting elements such as prompts for visuals, character actions, and teacher notes, which are then passed into NanoBanana PPT Skills to automatically assemble and style the PowerPoint deck.

Beyond static content, Gemini 3 produces transition and animation descriptions that guide Veo AI in rendering smooth video segments between slides, making the lesson feel like a coherent animated story rather than a static deck. This tight loop—topic in, structured script out, then auto-orchestrated media and transitions—means Gemini 3 is not just an add-on but the engine that defines narrative flow, pedagogy level, and multimodal assets for every NanoClass lesson.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
