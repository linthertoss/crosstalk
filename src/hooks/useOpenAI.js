import { useRef, useCallback, useState } from "react";
import OpenAI from "openai";

function useOpenAI(apiKey) {
  const openai = useRef(null);

  // Initialize the OpenAI client
  const initializeOpenAI = useCallback(() => {
    openai.current = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Be cautious with this in production
    });
  }, [apiKey]);

  // Function to generate a response from OpenAI based on the given prompt
  const generateResponse = useCallback(async (prompt, settings) => {
    try {
      const completion = await openai.current.completions.create({
        model: settings.model || "gpt-3.5-turbo-instruct",
        prompt: prompt,
        max_tokens: settings.max_tokens || 100,
        temperature: settings.temperature || 0.3,
        frequency_penalty: settings.frequency_penalty || 1,
        stop: settings.stop || undefined,
      });
      return completion.choices[0].text.trim();
    } catch (error) {
      console.error("Error generating response from OpenAI: ", error);
      return "";
    }
  }, []);

  // Initialize OpenAI on mount
  useState(() => {
    initializeOpenAI();
  }, [initializeOpenAI]);

  return { generateResponse };
}

export default useOpenAI;
