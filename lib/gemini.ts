import Constants from 'expo-constants';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the configuration safely
const GeminiApiKey = Constants.expoConfig?.extra?.GeminiApiKey || 
                     process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
                     'default-dev-key';

const genAI = new GoogleGenerativeAI(GeminiApiKey);

export async function analyzeImage(imageUri: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const base64Data = (base64 as string).split(',')[1];

    const result = await model.generateContent([
      'Look at this image and respond based on these rules:\n' +
      '1. If there\'s text with a question, only provide the answer - nothing else\n' +
      '2. If there\'s text with instructions, only do what it says - nothing else\n' +
      '3. If it\'s just an image without text, provide a brief 2-3 line analysis\n' +
      'Important: Keep responses extremely concise and direct. No introductions or explanations.',
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