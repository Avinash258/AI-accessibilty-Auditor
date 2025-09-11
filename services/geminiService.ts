

import { GoogleGenAI, Type } from "@google/genai";
import type { AccessibilityReport, AuditRule, AccessibilityIssue, FixSuggestion } from '../types';
import { ImpactLevel } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reportSchema = {
    type: Type.OBJECT,
    properties: {
        url: { type: Type.STRING },
        timestamp: { type: Type.STRING },
        violations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: Object.values(ImpactLevel).filter(i => i !== ImpactLevel.None) },
                    description: { type: Type.STRING },
                    help: { type: Type.STRING },
                    helpUrl: { type: Type.STRING },
                    htmlElementSnippet: { type: Type.STRING },
                    visualAidUrl: { type: Type.STRING, description: "A URL to a public-domain video or image illustrating the issue." },
                },
                required: ['id', 'impact', 'description', 'help', 'helpUrl', 'visualAidUrl']
            }
        },
        incomplete: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: Object.values(ImpactLevel).filter(i => i !== ImpactLevel.None) },
                    description: { type: Type.STRING },
                    help: { type: Type.STRING },
                    helpUrl: { type: Type.STRING },
                    htmlElementSnippet: { type: Type.STRING },
                    visualAidUrl: { type: Type.STRING, description: "A URL to a public-domain video or image illustrating the issue." },
                },
                required: ['id', 'impact', 'description', 'help', 'helpUrl', 'visualAidUrl']
            }
        },
        passes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: [ImpactLevel.None] },
                    description: { type: Type.STRING },
                    help: { type: Type.STRING },
                    helpUrl: { type: Type.STRING },
                },
                required: ['id', 'impact', 'description', 'help', 'helpUrl']
            }
        }
    },
    required: ['url', 'timestamp', 'violations', 'incomplete', 'passes']
};

async function generateReport(contents: string): Promise<AccessibilityReport> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: reportSchema,
                temperature: 0.1,
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as AccessibilityReport;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && (error.message.includes("JSON") || error.message.includes("unexpected token"))) {
            throw new Error("The AI model returned invalid JSON. This might be a temporary issue with the model's response format.");
        }
        throw new Error("The AI model failed to generate a valid report. It may have produced an unexpected format or the request failed.");
    }
}

export async function analyzeUrlAccessibility(url: string, compliance: string): Promise<AccessibilityReport> {
    const textPrompt = `You are an expert accessibility testing engine named "A11y-AI". Your purpose is to act as an accessibility consultant.
    
The user has provided the following URL: "${url}".

You **cannot access this URL**. Instead, based on the URL and your general knowledge of what kind of website it might be (e.g., e-commerce, blog, social media, news), you must generate a **hypothetical accessibility report**.

This report should serve as a **checklist of common issues** to investigate for this type of website. The findings are not based on a real scan but are **educated guesses** about potential problem areas.

Generate the report in JSON format, conforming to ${compliance} standards.

Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text or markdown formatting before or after the JSON.

**JSON Structure Description:**
The JSON object must have keys: "url", "timestamp", "violations", "incomplete", and "passes".
- For the "url" field, use the provided URL: "${url}".
- For "violations", list common critical issues that are often found on sites like this.
- For "incomplete", list issues that would typically require manual review. For example, 'Color contrast may be insufficient' or 'Tab order should be logical'.
- For "passes", you can list a few examples of accessibility features that are often implemented correctly on modern websites of this type.
- For each issue in "violations" and "incomplete", you MUST provide a "visualAidUrl". This URL should point to a public-domain image or short video that clearly illustrates the accessibility problem. The visual should be generic and educational. For instance, for a missing alt text, link to an image showing how a screen reader announces an image with and without alt text. For color contrast, show a side-by-side comparison of bad vs. good contrast.
- For "htmlElementSnippet", provide a **plausible, generic HTML snippet** that illustrates the potential issue. For example, for a missing alt text violation, you could provide \`<img src="product-image.jpg">\`.

Generate a comprehensive hypothetical report based on this consultative approach.`;
    
    return generateReport(textPrompt);
}

export async function analyzeHtmlAccessibility(html: string, compliance: string): Promise<AccessibilityReport> {
    const textPrompt = `You are an expert accessibility testing engine named "A11y-AI". Your purpose is to perform a thorough accessibility scan on the provided HTML source code, similar to running "axe-core".

Analyze the following HTML source code. The 'htmlElementSnippet' values in your report should be **extracted directly** from this source.
---
HTML SOURCE:
---
${html}
---

Based on your analysis, generate a detailed accessibility report in JSON format. The report must conform to ${compliance} standards.

Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text or markdown formatting before or after the JSON.

**JSON Structure Description:**
The JSON object must have keys: "url", "timestamp", "violations", "incomplete", and "passes".
- Set "url" to "N/A (HTML Source Provided)".
- "violations": Issues that fail the specified standard.
- "incomplete": Issues that require manual review (e.g., color contrast, as CSS is not available).
- "passes": Rules that were checked and passed.
- For each issue in "violations" and "incomplete", you MUST provide a "visualAidUrl". This URL should point to a public-domain image or short video that clearly illustrates the accessibility problem. The visual should be generic and educational.

**Analysis Guidelines:**
- Adhere strictly to the rules of the **${compliance}** standard.
- **Images:** Check for meaningful 'alt' attributes.
- **Forms:** Ensure all form inputs have associated <label> tags.
- **Headings:** Check for a logical and non-skipped heading order (H1, H2, H3...).
- **Links:** Ensure link text is descriptive.
- **Landmarks:** Identify the use of HTML5 landmark elements like <main>, <nav>, etc.
- **Language:** Check for the 'lang' attribute on the <html> element.

Generate a comprehensive report with findings based strictly on the provided HTML.`;

    return generateReport(textPrompt);
}

export async function findPossibleUrls(baseUrl: string): Promise<string[]> {
    const urlFinderSchema = {
        type: Type.OBJECT,
        properties: {
            urls: {
                type: Type.ARRAY,
                description: "An array of full URL strings found on the page.",
                items: {
                    type: Type.STRING
                }
            }
        },
        required: ['urls']
    };

    const textPrompt = `You are a helpful web crawler assistant. Your task is to identify potential, common, and plausible URLs on a given website.

    The user has provided the following base URL: "${baseUrl}".

    You cannot access this URL directly. Based on the domain name and common website structures, please generate a list of up to 10 likely URLs that would exist on this site. 
    
    Examples:
    - If the URL is "https://www.my-business.com", you might suggest "/about-us", "/contact", "/services", "/blog".
    - If the URL is "https://www.e-commerce-store.net/home", you might suggest "/products", "/cart", "/account", "/sale".

    Return a list of full, absolute URLs. If the provided base URL includes a path, make the new URLs relative to the root domain. For example, if given "https://example.com/blog/article1", suggest "https://example.com/about", not "https://example.com/blog/about".

    Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text or markdown formatting before or after the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: textPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: urlFinderSchema,
                temperature: 0.2,
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr) as { urls: string[] };
        return result.urls;
    } catch (error) {
        console.error("Error calling Gemini API for URL finding:", error);
         if (error instanceof Error && (error.message.includes("JSON") || error.message.includes("unexpected token"))) {
            throw new Error("The AI model returned invalid JSON. This might be a temporary issue with the model's response format.");
        }
        throw new Error("The AI model failed to generate a list of URLs.");
    }
}

export async function getAuditRulesList(compliance: string): Promise<AuditRule[]> {
    const rulesListSchema = {
        type: Type.OBJECT,
        properties: {
            rules: {
                type: Type.ARRAY,
                description: "An array of accessibility audit rules.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "The machine-readable ID for the rule (e.g., 'image-alt')." },
                        description: { type: Type.STRING, description: "A brief, one-sentence description of what the rule checks for." },
                        importance: { type: Type.STRING, description: "A short explanation of why this rule is important for accessibility." }
                    },
                    required: ['id', 'description', 'importance']
                }
            }
        },
        required: ['rules']
    };

    const textPrompt = `You are an expert on web accessibility standards. Your task is to generate a list of key accessibility rules that fall under the "${compliance}" standard.
    
Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text or markdown formatting before or after the JSON.

For each rule, please provide the following:
- "id": A machine-readable ID for the rule (e.g., 'image-alt', 'link-name').
- "description": A brief, one-sentence description of what the rule checks.
- "importance": A short explanation of why this rule is important for accessibility.

Generate a representative list of about 20-30 of the most common and impactful rules for the specified standard. Do not generate an exhaustive list of every single rule.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: textPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: rulesListSchema,
                temperature: 0.1,
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr) as { rules: AuditRule[] };
        return result.rules;
    } catch (error) {
        console.error("Error calling Gemini API for audit rules list:", error);
         if (error instanceof Error && (error.message.includes("JSON") || error.message.includes("unexpected token"))) {
            throw new Error("The AI model returned invalid JSON for the rules list.");
        }
        throw new Error("The AI model failed to generate a list of audit rules.");
    }
}

export type { FixSuggestion };

export async function getFixSuggestion(issue: AccessibilityIssue): Promise<FixSuggestion> {
    if (!issue.htmlElementSnippet) {
        throw new Error("HTML snippet is required to generate a suggestion.");
    }
    
    // 1. Generate text part: suggested code, image prompt, caption
    const suggestionPromptSchema = {
        type: Type.OBJECT,
        properties: {
            suggestedCode: { type: Type.STRING, description: 'The corrected HTML snippet that resolves the accessibility issue.' },
            imageGenPrompt: { type: Type.STRING, description: 'A detailed, descriptive prompt for an image generation model to create a visual representation of the UI issue. The prompt should describe a simple, clean UI render of the HTML snippet, with clear annotations (like red circles or arrows) highlighting the specific accessibility problem. Be literal and descriptive for the AI.' },
            imageCaption: { type: Type.STRING, description: 'A brief, user-facing caption that explains what the generated image is showing and how it relates to the issue.' },
        },
        required: ['suggestedCode', 'imageGenPrompt', 'imageCaption']
    };

    const textPrompt = `You are an expert web developer specializing in accessibility remediation.
    
    An accessibility audit found the following issue:
    - Description: ${issue.description}
    - Help Text: ${issue.help}
    - Problematic HTML Snippet: \`\`\`html\n${issue.htmlElementSnippet}\n\`\`\`

    Your task is to:
    1.  Provide a corrected version of the HTML snippet that fixes the issue.
    2.  Write a detailed, descriptive prompt for an image generation AI (like Imagen) to create a clear visual example of this issue. The image should be a simple, clean UI representation of the element. It should visually highlight what is wrong. For example, use red boxes or arrows to point out missing elements or bad contrast. The prompt should be self-contained and not refer to this conversation.
    3.  Write a brief, user-facing caption that explains what the generated image is showing.

    Provide the response as a single, valid JSON object conforming to the schema.`;

    let suggestionParts;
    try {
        const textGenResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: textPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionPromptSchema,
                temperature: 0.2,
            },
        });
        suggestionParts = JSON.parse(textGenResponse.text.trim());
    } catch (error) {
        console.error("Error generating text for fix suggestion:", error);
        throw new Error("The AI model failed to generate a textual suggestion.");
    }

    // 2. Generate the image
    try {
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: suggestionParts.imageGenPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });
        
        if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
            throw new Error("Image generation returned no images.");
        }

        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

        return {
            suggestedCode: suggestionParts.suggestedCode,
            imageUrl: imageUrl,
            imageCaption: suggestionParts.imageCaption,
        };
    } catch (error) {
         console.error("Error generating image for fix suggestion:", error);
         throw new Error("The AI model failed to generate a visual example.");
    }
}
