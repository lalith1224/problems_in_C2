interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY_ENV_VAR || "default_key";
  }

  private getSystemPrompt(userRole: string): string {
    const basePrompt = "You are a helpful AI assistant for MediConnect, a healthcare management platform. Always provide accurate, helpful information while emphasizing that you are not a substitute for professional medical advice.";

    switch (userRole) {
      case 'patient':
        return `${basePrompt} You are helping a patient. Provide general health information, symptom guidance, and encourage them to consult with healthcare professionals for proper diagnosis and treatment. Be supportive and informative while being clear about the limitations of AI advice.`;
      
      case 'doctor':
        return `${basePrompt} You are assisting a healthcare provider. Help with differential diagnoses, treatment considerations, drug interactions, and clinical decision support. Provide evidence-based information while encouraging clinical judgment and proper patient evaluation.`;
      
      case 'pharmacy':
        return `${basePrompt} You are helping a pharmacy professional. Assist with medication information, drug interactions, inventory optimization, alternative medications, and billing support. Focus on pharmaceutical expertise and business optimization.`;
      
      default:
        return basePrompt;
    }
  }

  async getChatResponse(message: string, userRole: string, context?: string): Promise<string> {
    try {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(userRole)
        }
      ];

      if (context) {
        messages.push({
          role: 'system',
          content: `Additional context: ${context}`
        });
      }

      messages.push({
        role: 'user',
        content: message
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://mediconnect.app',
          'X-Title': 'MediConnect',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      return data.choices[0].message.content;

    } catch (error) {
      console.error('OpenRouter service error:', error);
      
      // Fallback responses based on user role
      switch (userRole) {
        case 'patient':
          return "I'm experiencing some technical difficulties right now. For immediate health concerns, please contact your healthcare provider or emergency services if urgent.";
        case 'doctor':
          return "AI assistant is temporarily unavailable. Please refer to your clinical guidelines and professional judgment for patient care decisions.";
        case 'pharmacy':
          return "AI assistant is currently offline. Please refer to your pharmaceutical databases and professional resources for medication information.";
        default:
          return "I'm sorry, but I'm experiencing technical difficulties. Please try again later or contact support if this persists.";
      }
    }
  }

  async getHealthInsights(userRole: string, healthData: any): Promise<string> {
    const contextualPrompt = this.buildHealthInsightsPrompt(userRole, healthData);
    return this.getChatResponse(contextualPrompt, userRole);
  }

  private buildHealthInsightsPrompt(userRole: string, healthData: any): string {
    switch (userRole) {
      case 'patient':
        return `Based on my health profile, can you provide some general wellness tips? I'm ${healthData.age || 'an adult'} and my main concerns are around general health maintenance.`;
      
      case 'doctor':
        return `Can you help analyze this patient case and suggest potential differential diagnoses or treatment considerations? Patient data: ${JSON.stringify(healthData)}`;
      
      case 'pharmacy':
        return `Based on our current inventory and prescription trends, what recommendations do you have for stock optimization? Current data: ${JSON.stringify(healthData)}`;
      
      default:
        return "Can you provide some general health and wellness advice?";
    }
  }
}

export const openRouterService = new OpenRouterService();
