# Project Requirements Document (PRD)

**Project Name:** RentaGraph (or similar) - LLM Knowledge Base Compiler
**Goal:** Build an autonomous LLM knowledge base for the Spanish "Declaración de la Renta," proving Andrej Karpathy's concept of an LLM as a "wiki compiler." Hosted on Vercel with a BYOK architecture for zero-cost public scaling.

## 1\. System Architecture Overview

The system is divided into two distinct parts:

1.  **The Offline Compiler (Python CLI):** Scrapes raw tax documents and uses an LLM to autonomously write and maintain a structured folder of Markdown (`.md`) files.
2.  **The Web App & Agent (Next.js/Vercel):** A web interface that allows users to browse the generated Markdown wiki and chat with it using their own API key.

## 2\. Phase 1: The Offline Data Pipeline ("The Compiler")

*This runs locally or via GitHub Actions. It is NOT part of the real-time web app.*

  * **Data Sources:**
      * Scrape/download the *Manual Práctico de Renta 2025* (PDF/HTML) from the Agencia Tributaria website.
      * Specific regional deductions (Normativa Autonómica) from the BOE.
  * **Parsing:**
      * Use **LlamaParse** or Microsoft's **MarkItDown** to convert complex tax PDFs (especially tables and tax brackets) into raw Markdown.
  * **LLM Compilation (The Karpathy Method):**
      * Write a Python script using **Instructor** or standard API calls.
      * Feed the raw Markdown to an LLM (e.g., Gemini 1.5 Pro or GPT-4o) and prompt it to break the information down into discrete concepts.
      * **Output:** A directory called `/content/wiki/` containing interconnected `.md` files.
      * *Requirement:* Each `.md` file must include YAML frontmatter (e.g., `title`, `tags`, `source_url`) and Markdown backlinks to other concepts (e.g., `[[Base Imponible]]`).

## 3\. Phase 2: The Next.js Web Application

*Hosted on Vercel. Framework: Next.js (App Router), Tailwind CSS, shadcn/ui.*

### 3.1. User Interface (Dual-Pane Layout)

  * **Left Pane (The Wiki Explorer):** A file-tree component displaying the generated `/content/wiki/` directory. Users can click any `.md` file to read the AI-compiled tax rules exactly as the LLM wrote them.
  * **Right Pane (The Agent UI):** A chat interface powered by the **Vercel AI SDK**.
  * **The Disclaimer (CRITICAL):** A sticky, unmissable banner at the top of the app: *"🚨 Experimental AI Knowledge Base. Not financial or legal advice. Always consult the AEAT or a Gestor."*

### 3.2. The BYOK (Bring Your Own Key) Mechanism

  * **Onboarding State:** When a user first visits, the chat input is disabled. A modal prompts them to "Enter your OpenAI / Anthropic / Google API Key to enable chat."
  * **Storage:** Store the API key securely in the browser's `localStorage`. *Never* save it to a database or log it.
  * **Edge Routing:** Pass the client-side key securely in the authorization header of the API request to your Next.js Edge functions.

### 3.3. The Pre-Computed Demo (For non-technical users)

  * To ensure social media visitors understand the value without an API key, include a **"View Demo Queries"** button.
  * This will display 3 hardcoded, pre-saved chat transcripts of complex tax questions (e.g., regional rent deductions in Madrid, crypto sales) and the agent's perfect response, including citations.

## 4\. Phase 3: The RAG & Citation Engine

  * **Vectorization:** During the GitHub build process (or via a GitHub Action), chunk the `/content/wiki/` Markdown files and embed them into a serverless Vector DB (e.g., **Supabase Vector**, **Pinecone**, or a lightweight local SQLite/Chroma instance if feasible on Vercel).
  * **The Chat Flow:**
    1.  User asks a question (using their API key).
    2.  System embeds the query and retrieves the top-K relevant `.md` files from the wiki.
    3.  System injects the Markdown content into the prompt.
    4.  LLM streams the response back via Vercel AI SDK.
  * **Mandatory Citations:** The prompt MUST enforce that the LLM cites its sources. The frontend must parse these citations and render them as clickable UI elements that link directly to the `.md` file in the Left Pane. (e.g., *"According to [Deducción Alquiler Madrid](https://www.google.com/search?q=%23), you need..."*)

## 5\. Phase 4: Open Source & Social Readyness

  * **Clear Repository Structure:**
      * `/scraper/` -\> The data extraction scripts.
      * `/compiler/` -\> The LLM script that creates the Markdown files.
      * `/app/` -\> The Next.js Vercel code.
      * `/content/wiki/` -\> The actual compiled knowledge base.
  * **README.md:** Must include a high-quality architecture diagram (Excalidraw) explaining the separation between the *Compiler* and the *Agent*, emphasizing the token-saving and hallucination-reducing benefits of this approach over standard naive RAG.