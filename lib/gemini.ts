import Constants from 'expo-constants';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the Gemini API key from config
const geminiApiKey = 
  Constants.expoConfig?.extra?.geminiApiKey || 
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
  'default-dev-key';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(geminiApiKey);

/**
 * Analyze an image using Gemini AI
 * 
 * @param imageUri - The URI of the image to analyze
 * @returns The analysis text
 */
export async function analyzeImage(imageUri: string): Promise<string> {
  try {
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Fetch the image and convert to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Extract the base64 data part (remove the data URL prefix)
    const base64Data = base64.split(',')[1];

    // Make the Gemini API request
    const result = await model.generateContent([
      'Look at this image and respond based on these rules:\n' +
      '1. If there\'s text with a question, provide a detailed answer.\n' +
      '2. If there\'s text with instructions, follow them precisely.\n' +
      '3. If it\'s just an image without text, provide a brief but descriptive analysis.\n' +
      'Important: Keep responses concise and direct. No introductions or explanations.',
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Error analyzing image:', error);
    return 'Failed to analyze image';
  }
}