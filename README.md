# Puneeth R — Engineering Portfolio

**Java backend engineering, fintech APIs, and practical systems design.**

[Visit the live portfolio](https://puneethx47.github.io/portfolio/) · [GitHub profile](https://github.com/puneethx47) · [LinkedIn](https://www.linkedin.com/in/puneethr47/)

A personal portfolio presenting my software engineering experience, technical focus, and selected projects. It connects backend architecture to concrete examples through service-flow diagrams, case studies, and a focused skills overview.

## Highlights

- Java, Spring Boot, microservices, Kafka, and relational data expertise.
- An experience-led overview of banking and lending workflows, aligned with the current résumé.
- Banking service and LRU cache architecture case studies.
- Expandable architecture diagrams on mobile, with public source and private learning projects clearly identified.
- Experience timeline and professional development.
- An in-page résumé viewer with zoom controls and the phone number omitted.
- A public PDF copy of the supplied résumé with the phone number removed from its text content.
- Responsive navigation, keyboard-friendly controls, and reduced-motion support.
- A separate learning focus for Spring AI, RAG, and MCP.
- Native Web Animations API and Intersection Observer interactions.
- A public visit count with a 30-minute revisit window and cached fallback.

## Technology

**HTML · CSS · Vanilla JavaScript · GitHub Pages**

The site has no app build step or npm dependencies. Google Fonts supplies typography, and Tick.rs supplies the public visit total.

## Preview locally

Prerequisite: **Python 3**, or another static HTTP server.

```bash
git clone https://github.com/puneethx47/portfolio.git
cd portfolio
python3 -m http.server 8000
```

Open `http://localhost:8000`. Localhost previews do not increment the public visit count.

## Customize the content

| Location | Content |
| :--- | :--- |
| [`index.html`](index.html) | Introduction, skills, experience, projects, credentials, contact links, and metadata |
| [`styles.css`](styles.css) | Colors, typography, layout, responsive rules, and reduced-motion styling |
| [`script.js`](script.js) | Navigation, animation, résumé controls, and visit counter |
| [`assets/`](assets/) | Résumé preview and supporting credential assets |
| [`assets/Puneeth_R_Resume_Public.pdf`](assets/Puneeth_R_Resume_Public.pdf) | Current public résumé PDF with the phone number removed |
| [`og.png`](og.png) | Social sharing preview |
| [`favicon.svg`](favicon.svg) | Site icon |

When changing the deployment URL, update the canonical URL and Open Graph/Twitter URLs in `index.html`. Stylesheet and script query strings are versioned there for cache refreshes.

## Publish

The live site is served through GitHub Pages at the link above. Content changes belong on this repository's `main` branch; GitHub Pages deployment settings are managed in the repository settings.

## Contact

[puneethr1954@gmail.com](mailto:puneethr1954@gmail.com) · [LinkedIn](https://www.linkedin.com/in/puneethr47/)
