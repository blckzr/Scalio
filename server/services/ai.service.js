const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.config = {
      model: process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash-exp',
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 2000,
      retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS) || 3,
      retryDelay: parseInt(process.env.AI_RETRY_DELAY) || 1000,
    };

    this.tokenUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      requestCount: 0,
    };

    logger.info('AI Service initialized with Google Gemini', {
      model: this.config.model,
      temperature: this.config.temperature,
    });
  }

  getModel(modelName = null) {
    const model = modelName || this.config.model;
    return this.genAI.getGenerativeModel({ 
      model: model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      },
    });
  }

  async complete(prompt, options = {}) {
    const startTime = Date.now();

    try {
      logger.info('Sending request to Google Gemini', {
        model: options.model || this.config.model,
        promptLength: prompt.length,
      });

      let fullPrompt = prompt;
      if (options.systemMessage) {
        fullPrompt = `${options.systemMessage}\n\n${prompt}`;
      }

      const result = await this.withRetry(async () => {
        const model = this.getModel(options.model);
        const response = await model.generateContent(fullPrompt);
        return response;
      });

      const responseText = result.response.text();
      const duration = Date.now() - startTime;

      const estimatedPromptTokens = Math.ceil(fullPrompt.length / 4);
      const estimatedCompletionTokens = Math.ceil(responseText.length / 4);

      this.tokenUsage.promptTokens += estimatedPromptTokens;
      this.tokenUsage.completionTokens += estimatedCompletionTokens;
      this.tokenUsage.totalTokens += estimatedPromptTokens + estimatedCompletionTokens;
      this.tokenUsage.requestCount += 1;

      logger.info('Gemini request completed', {
        duration: `${duration}ms`,
        estimatedTokens: estimatedPromptTokens + estimatedCompletionTokens,
      });

      return {
        success: true,
        completion: responseText,
        metadata: {
          model: options.model || this.config.model,
          duration,
          usage: {
            promptTokens: estimatedPromptTokens,
            completionTokens: estimatedCompletionTokens,
            totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
          },
        },
      };
    } catch (error) {
      logger.error('Gemini request failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        metadata: {
          duration: Date.now() - startTime,
        },
      };
    }
  }

  async chat(messages, options = {}) {
    const startTime = Date.now();

    try {
      logger.info('Sending chat request to Google Gemini', {
        messageCount: messages.length,
      });

      const history = [];
      let lastMessage = '';

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (msg.role === 'system') {
          continue;
        } else if (msg.role === 'user') {
          if (i === 0 && messages.some(m => m.role === 'system')) {
            const systemMsg = messages.find(m => m.role === 'system');
            lastMessage = `${systemMsg.content}\n\n${msg.content}`;
          } else {
            lastMessage = msg.content;
          }
          
          if (i < messages.length - 1) {
            history.push({ role: 'user', parts: [{ text: lastMessage }] });
          }
        } else if (msg.role === 'assistant') {
          history.push({ role: 'model', parts: [{ text: msg.content }] });
        }
      }

      const result = await this.withRetry(async () => {
        const model = this.getModel(options.model);
        const chat = model.startChat({ history });
        const response = await chat.sendMessage(lastMessage);
        return response;
      });

      const responseText = result.response.text();
      const duration = Date.now() - startTime;

      // Estimate token usage
      const totalPromptLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const estimatedPromptTokens = Math.ceil(totalPromptLength / 4);
      const estimatedCompletionTokens = Math.ceil(responseText.length / 4);

      this.tokenUsage.promptTokens += estimatedPromptTokens;
      this.tokenUsage.completionTokens += estimatedCompletionTokens;
      this.tokenUsage.totalTokens += estimatedPromptTokens + estimatedCompletionTokens;
      this.tokenUsage.requestCount += 1;

      logger.info('Gemini chat completed', {
        duration: `${duration}ms`,
        estimatedTokens: estimatedPromptTokens + estimatedCompletionTokens,
      });

      return {
        success: true,
        completion: responseText,
        metadata: {
          model: options.model || this.config.model,
          duration,
          usage: {
            promptTokens: estimatedPromptTokens,
            completionTokens: estimatedCompletionTokens,
            totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
          },
        },
      };
    } catch (error) {
      logger.error('Gemini chat failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        metadata: {
          duration: Date.now() - startTime,
        },
      };
    }
  }

  async generateJSON(prompt, schema, options = {}) {
    try {
      logger.info('Generating JSON with Google Gemini', { schema });

      const jsonPrompt = `${prompt}

Return ONLY valid JSON matching this schema:
${JSON.stringify(schema, null, 2)}

Do not include any explanation or markdown formatting. Return only the JSON object.`;

      const result = await this.complete(jsonPrompt, options);

      if (!result.success) {
        return result;
      }

      let jsonText = result.completion.trim();
      
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const data = JSON.parse(jsonText);

      return {
        success: true,
        data,
        metadata: result.metadata,
      };
    } catch (error) {
      logger.error('JSON generation failed', { error: error.message });
      return {
        success: false,
        error: `Failed to parse JSON: ${error.message}`,
        rawResponse: result?.completion,
      };
    }
  }

  async withRetry(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
          throw error;
        }

        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryDelay * attempt;
          logger.warn(`Gemini request failed, retrying (${attempt}/${this.config.retryAttempts})`, {
            error: error.message,
            retryIn: `${delay}ms`,
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logger.error('Gemini request failed after all retries', { error: lastError.message });
    throw lastError;
  }

  getTokenUsage() {
    return {
      totalRequests: this.tokenUsage.requestCount,
      promptTokens: this.tokenUsage.promptTokens,
      completionTokens: this.tokenUsage.completionTokens,
      totalTokens: this.tokenUsage.totalTokens,
      averagePerRequest:
        this.tokenUsage.requestCount > 0
          ? Math.round(this.tokenUsage.totalTokens / this.tokenUsage.requestCount)
          : 0,
    };
  }

  resetTokenUsage() {
    this.tokenUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      requestCount: 0,
    };
    logger.info('Token usage statistics reset');
  }
}

module.exports = new AIService();