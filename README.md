# Exam Practice Website

## Project Overview
This project is an interactive **Exam Practice Application** built to help users take practice exams (e.g., AWS Certified Cloud Practitioner). It features a premium, modern **Retro-Futurism / Cyberpunk aesthetic** with deep-space dark themes, glowing neon accents, and smooth micro-interactions.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 (configured with custom neon colors, glassmorphism, and animations)
- **Icons**: Lucide React

## Core Architecture & Features
1. **Exam Selection Dashboard**: Grid of available exams with descriptions and question counts.
2. **Exam Taking Interface**:
   - Supports both **Single Choice** and **Multiple Choice** ("Select exactly N") questions.
   - **Hints**: Expandable hint section via a toggle button.
   - **Mark for Review**: Flag icon to mark questions for later review.
   - Interactive selections with neon highlights, custom selection states, and hover micro-interactions.
3. **Exam Results / Review**:
   - Score calculation displayed as a percentage and "X out of Y" correct format.
   - Expandable detailed review for each question.
   - Correctly answered questions are marked with a neon-cyan checkmark and remain collapsed by default.
   - Incorrectly answered questions display a red X. When expanded, they highlight the user's wrong choices, point out the correct answers, and display a detailed explanation.
   - Ability to "Retake Exam" (clears state) or "Choose Another Exam".

---

## 🤖 Agent / AI Assistant Guidelines
When iterating on this codebase, AI agents should strictly adhere to the following rules:

### Styling & CSS (Retro-Futuristic Aesthetic)
- **Theme First**: Always use the dark theme as the base (`bg-deep-space`, `#0B0B0F` or similar deep colors). Do not introduce light theme components unless explicitly requested.
- **Neon Accents**: Use defined neon colors for interactive states and highlights (e.g., `text-neon-cyan`, `border-neon-pink`, `bg-neon-cyan/10`).
- **Glassmorphism & Glows**: Implement glassmorphism using `backdrop-blur` utilities and partial opacity backgrounds (`bg-[#1A1A2E]/80`). Add glowing shadows (e.g., `shadow-[0_0_15px_rgba(255,0,255,0.3)]`) for active/hover states.
- **Micro-interactions**: Use Tailwind's transition utilities (`transition-all duration-300`, `hover:-translate-y-0.5`) and custom keyframes (`animate-fade-in`) to ensure dynamic, smooth interactions. The UI must feel premium and alive.
- **Framework Setup**: Proceed with Tailwind CSS utilities. Avoid adding raw CSS where Tailwind utilities suffice, unless configuring complex animations in `index.css`.

### Testing & Verification
- **Integration Tests**: The core E2E user flows are defined in `integration_test_cases.csv`.
- **Methodology**: Use Playwright (or Playwright MCP) to validate E2E user flows. Ensure any new UI modifications or feature additions do not break the 16 core test cases identified in the CSV.

### Coding Standards
- Use functional React components with hooks.
- Maintain strict TypeScript typings for all component props, state, and mock data structures.
- Keep components focused and reusable. Maintain separation of concerns between state management (Exam Taking progression array/indexes) and UI presentation.
