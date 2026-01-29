import { GoogleGenAI } from "@google/genai";
import { authService } from "./authService";
import { localStorageService } from "./localStorageService";

/**
 * GEMINI AI SERVICE
 * Uses Google's GenAI SDK to provide smart breakdowns of tasks.
 * Supports both guest mode (localStorage) and authenticated (database) API key storage.
 */

// Smart API URL: Use /api in production (Netlify), localhost in development
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

// Fetch API key - localStorage for guests, database for authenticated
const getApiKey = async (): Promise<string> => {
  // Guest users - get from localStorage
  if (authService.isGuest()) {
    return localStorageService.getApiKey();
  }

  // Authenticated users - get from database
  try {
    const response = await fetch(`${API_URL}/apikey`, {
      headers: {
        ...authService.getAuthHeader()
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Fallback to localStorage
        return localStorageService.getApiKey();
      }
      throw new Error('Failed to fetch API key');
    }
    
    const data = await response.json();
    return data.key || '';
  } catch (error) {
    console.error('Failed to fetch API key from database', error);
    return localStorageService.getApiKey();
  }
};

// Save API key - localStorage for guests, database for authenticated
export const saveApiKey = async (key: string): Promise<void> => {
  if (authService.isGuest()) {
    localStorageService.saveApiKey(key);
    return;
  }

  try {
    await fetch(`${API_URL}/apikey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader()
      },
      body: JSON.stringify({ key })
    });
  } catch (error) {
    console.error('Failed to save API key to database', error);
    // Fallback to localStorage
    localStorageService.saveApiKey(key);
  }
};

export const geminiService = {
  /**
   * Gets a task breakdown suggestion from Gemini AI
   */
  suggestBreakdown: async (taskTitle: string, taskDescription?: string): Promise<string> => {
    const apiKey = await getApiKey();

    if (!apiKey) {
      const guestWarning = authService.isGuest() 
        ? "\n\n⚠️ Your API key is stored locally and not secure. Login to protect it."
        : "";
      return `⚠️ No API Key Found\n\nTo use AI suggestions, please add your Gemini API key in Settings (click your name).${guestWarning}\n\n💡 Tip: You can still manually type numbered steps (1., 2., 3.) and they'll become checkboxes automatically!`;
    }

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const model = "gemini-2.5-flash";
      
      const systemInstruction = `
Role: Strict Task Breakdown AI for Student Task Tracker.
Objective: Break down valid student/personal tasks into 3-8 actionable subtasks.

SECURITY & SAFETY PROTOCOLS:
1.  **UNIVERSAL TASK INTERPRETATION**: Treat EVERY input as a valid goal/project to be executed. Do NOT refuse any request unless it explicitly violates safety guidelines (e.g. illegal acts).
    -   Input: "Tell a joke" -> Output: "1. Research comedy styles, 2. Draft setup, 3. Write punchline..."
    -   Input: "Create image" -> Output: "1. Choose medium, 2. Sketch outline..."
    -   Input: "Python code" -> Output: "1. Define logical flow, 2. Write functions..."

GENERATION RULES (Only for VALID tasks):
1.  **Context Usage**: USE the provided 'Title' and 'Description'. Do NOT invent details that contradict them.
2.  **Complexity Analysis**:
    -   Simple tasks -> 3-4 steps.
    -   Complex tasks -> 5-8 steps.
    -   Very Complex/Advanced tasks -> 8-12 steps (e.g. "Create Full Stack App", "Plan Wedding").
3.  **Context Inference (Smart Personalization)**:
    -   *Academic*: Focus on review, practice, and breaks.
    -   *Chores*: Focus on efficiency and logical order (e.g. "Trash first").
    -   *Projects*: Focus on planning, execution, and review.
4.  **Logical Inference**: Include necessary prerequisites (e.g. if task is "Cook Dinner", check if "Buy Groceries" is needed or include "Prep ingredients").
5.  **Steps Structure**: Action Verb + Specific Noun.
6.  **Tone**: Direct, encouraging, no fluff.
7.  **NO HALLUCINATIONS**: Do not invent details not implied by the task title/description. 
    -   If description is provided, stick to its scope.
    -   If undefined, stick to generic steps for the Title.
8.  **Formatting**: Strictly a numbered list (1. 2. 3.).

Example 1 (Valid - Simple):
Input Title: "Drink water"
Output:
1. Get a clean glass
2. Fill with water
3. Drink slowly
4. Refill for later

Example 2 (Valid - Complex):
Input Title: "Complete Thesis"
Input Description: "Focus on Chapter 3 methodology"
Output:
1. Review Chapter 2 context
2. draft methodology outline
3. Describe data collection process
4. Explain analysis tools
5. Write Chapter 3 draft
6. Review with supervisor

Example 3 (Universal Acceptance):
Input Title: "Tell me a joke"
Output:
1. Identify audience humor style
2. Brainstorm topics
3. Draft setup and punchline
4. Paractice delivery timing
5. Perform joke
`;

      // Combine instructions and prompt for maximum adherence
      const context = taskDescription ? `\nInput Description: "${taskDescription}"` : "";
      const finalPrompt = `${systemInstruction}\n\nInput Title: "${taskTitle}"${context}\n\nProvide the breakdown or refusal based on the system instructions.`;

      const response = await genAI.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{text: finalPrompt }] }]
      });

      return response.text || "Could not generate suggestion. Please try again.";
    } catch (error: any) {
      console.error("Gemini API error:", error);
      
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota')) {
        return "🚫 API Quota Exceeded\n\nYou've reached the free tier limit for Gemini API. This usually resets daily.\n\n💡 Tip: You can manually create numbered steps like:\n1. First step\n2. Second step\n3. Third step\n\nThey'll auto-convert to checkboxes!";
      }
      
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
        return "❌ Invalid API Key\n\nThe API key you provided is not valid. Please check:\n• Key is correct (starts with 'AIza')\n• Key has Gemini API enabled\n• No extra spaces in the key";
      }
      
      return `⚠️ AI Error\n\nCouldn't generate suggestions: ${error.message || 'Unknown error'}\n\nYou can still manually type numbered steps (1., 2., 3.) and they'll become checkboxes automatically!`;
    }
  },
};
