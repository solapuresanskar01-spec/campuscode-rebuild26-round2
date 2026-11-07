# CampusCode — ReBuild '26 Round 2

An editorial, frontend-only CampusCode landing page built with semantic HTML, CSS, and vanilla JavaScript.

## Preview

Open `index.html` directly or serve the project root with any static file server. Inter and DM Mono are loaded from Google Fonts; system fallbacks are included. Login and registration are visual frontend previews and do not connect to an authentication service.

## Page structure

- **Navigation and hero:** Establish the BUILD. COMPETE. SHIP. identity and offer direct section, login, and registration routes.
- **Ecosystem:** A CSS diagram shows how students, teams, organizers, and hackathons connect through the platform.
- **Build loop and playbook:** Interactive BUILD / COMPETE / SHIP links lead into the four-step discovery-to-submission timeline.
- **Arena:** Three hackathon themes link to registration.
- **Mission and community:** Oversized editorial typography and a lightweight SVG network explain the platform's purpose and collaborative focus.
- **Final CTA and footer:** A high-contrast registration prompt and grouped product, builder, and guide links close the page.

The mobile menu, scroll reveals, hover/focus states, and decorative motion use native browser APIs and CSS. Motion is reduced when the visitor prefers reduced motion.

## Registration

`register.html` uses the existing PNG icons in `assets/icons/` and its own `css/register.css` and `js/register.js`. The form validates profile fields, password requirements, confirmation, terms acceptance, and a five-digit demo CAPTCHA. Submission is a local mock only; it does not create an account or send personal information. This static project has no package manifest or production build command.
