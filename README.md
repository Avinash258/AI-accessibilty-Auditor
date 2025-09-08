# AI Accessibility Auditor

[![Powered by Google Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue.svg)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-powered tool that analyzes web pages for accessibility issues, providing a detailed, actionable report to help developers build more inclusive websites.

*(A representative screenshot of the application interface would be placed here, typically showing the input form and a generated report.)*

---

## ✨ Key Features

- **🤖 AI-Powered Analysis**: Leverages the Google Gemini model to perform intelligent accessibility audits.
- **✌️ Dual Analysis Modes**:
  - **Hypothetical URL Audit**: Generates a checklist of potential issues based on the type of page a URL represents (e.g., e-commerce, blog) without accessing the site directly.
  - **Direct HTML Audit**: Performs a direct analysis of pasted HTML source code for specific violations.
- **📊 Comprehensive Reports**: Categorizes findings into `Violations`, `Needs Manual Review`, and `Passed Tests`, complete with impact levels and code snippets.
- **🌍 Compliance Standards**: Supports analysis against multiple standards, including WCAG 2.1 AA, ADA, Section 508, and EAA.
- **📁 Multi-Format Export**: Download audit reports in various formats: JSON, HTML, CSV, PDF, and DOCX.
- **🚀 Modern Tech Stack**: Built with React 19 and Tailwind CSS, running entirely in the browser with no backend required.
- **🎨 Sleek UI**: Features a clean, responsive design with built-in dark mode.

---

## 🏛️ Architecture

This project is a client-side Single-Page Application (SPA) with no backend. All logic, from UI rendering to API communication, happens in the user's browser. It uses an `importmap` in `index.html` to load libraries like React and the Gemini SDK directly from a CDN, eliminating the need for a traditional build step.

### Architecture Flow Diagram

```mermaid
graph TD
    subgraph User's Browser
        User(👤 User) -- Interacts with --> App[React App UI]
        App -- Provides URL/HTML --> InputForm[Input Forms]
        InputForm -- Triggers Scan --> App
        App -- Displays Results --> ReportDisplay[Report Display]
        ReportDisplay -- Triggers Download --> App
        App -- Initiates File Save --> BrowserAPI[Browser Download API]
        BrowserAPI -- Saves File --> User
    end

    subgraph App Logic (Client-Side)
        App -- "handleScan()" --> GeminiService[Gemini Service]
        App -- Passes Report --> ReportDisplay
        App -- "handleExport()" --> ReportExporter[Report Exporter Service]
        ReportExporter -- Generates File Blob --> BrowserAPI
    end

    subgraph External Services
        GeminiAPI[🤖 Google Gemini API]
    end

    GeminiService -- Constructs Prompt & Schema --> GeminiService
    GeminiService -- "generateContent()" API Call --> GeminiAPI
    GeminiAPI -- Returns JSON Report --> GeminiService
    GeminiService -- Parses & Returns Report --> App

    style User fill:#cde4ff,stroke:#6a8eae,stroke-width:2px
    style GeminiAPI fill:#d2ffd2,stroke:#5c8b5c,stroke-width:2px
```

### Technology Stack

- **Core Framework**: **React 19**
- **Language**: **TypeScript**
- **AI Service**: **Google Gemini API** (`@google/genai`)
- **Styling**: **Tailwind CSS**
- **Client-Side Exporting**:
  - **jsPDF** & **jspdf-autotable** (for PDF)
  - **docx** (for Word .docx)
  - **Native Blob/URL APIs** (for JSON, HTML, CSV)

---

## 🚀 How It Works

1.  **Input**: The user selects an analysis mode (URL or HTML) and provides the necessary input. They can also select a compliance standard.
2.  **Prompt Engineering**: The `geminiService` constructs a detailed prompt. This prompt instructs the AI to act as an accessibility expert and specifies the exact JSON schema required for the response.
3.  **API Call**: The service sends the prompt and the user's input to the Google Gemini API (`gemini-2.5-flash` model).
4.  **Structured Output**: The Gemini API is configured with a `responseSchema`, forcing it to return a valid, structured JSON object containing the accessibility findings.
5.  **Report Generation**: The application parses the JSON response into an `AccessibilityReport` object.
6.  **Display & Export**: The report is rendered in the UI using React components. The `reportExporter` service can then transform this report object into various downloadable file formats.

---

## 🛠️ Getting Started

This project is designed to run directly in the browser without a build step.

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Safari).
- An environment where the `API_KEY` environment variable is set. The application is configured to read this key directly from `process.env.API_KEY`.

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-accessibility-auditor.git
    cd ai-accessibility-auditor
    ```

2.  **Serve the application:**
    Since there's no build step, you just need a simple local web server.
    
    Using Node.js (`serve` package):
    ```bash
    npx serve .
    ```

    Using Python 3:
    ```bash
    python -m http.server
    ```

3.  **Open in browser:**
    Navigate to `http://localhost:3000` (or the port specified by your server).

---

## 📁 Project Structure

```
.
├── index.html              # Main HTML entry point with importmap
├── index.tsx               # React application root
├── App.tsx                 # Main application component, state management
├── metadata.json           # App metadata for the hosting environment
├── README.md               # This file
├── types.ts                # TypeScript type definitions (e.g., AccessibilityReport)
├── data/
│   └── complianceData.ts   # Data for the compliance standards reference
├── services/
│   ├── geminiService.ts    # Logic for interacting with the Gemini API
│   └── reportExporter.ts   # Logic for exporting reports to different formats
└── components/
    ├── Header.tsx          # Site header
    ├── UrlInputForm.tsx    # Form for URL input
    ├── HtmlInputForm.tsx   # Form for HTML input
    ├── ReportDisplay.tsx   # Renders the full report summary and sections
    ├── ReportSection.tsx   # A collapsible section of the report (e.g., Violations)
    ├── IssueCard.tsx       # A card displaying a single accessibility issue
    ├── Loader.tsx          # Loading spinner component
    ├── CodeSnippet.tsx     # Component for displaying highlighted code
    ├── ComplianceReference.tsx # Modal with details on compliance standards
    └── icons.tsx           # Reusable SVG icons
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Create a new Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
