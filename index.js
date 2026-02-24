import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import readline from "readline";
import { convertUnits } from "./unitConverter.js";

// LLM Definition
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Tool Definition for LLM
const tools = [
  {
    type: "function",
    function: {
      name: "convertUnits",
      description: "Convert units between temperature, distance, and weight",
      parameters: {
        type: "object",
        properties: {
          value: { type: "number" },
          sourceUnit: { type: "string" },
          targetUnit: { type: "string" }
        },
        required: ["value", "sourceUnit", "targetUnit"]
      }
    }
  }
];

// User Input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion() {
  rl.question("Enter conversion request (or type 'exit'): ", async (input) => {

    if (input.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: input }],
      tools: tools,
      tool_choice: "auto"
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = convertUnits(args.value, args.sourceUnit, args.targetUnit);

      console.log(
        `${args.value} ${args.sourceUnit} is ${result.toFixed(2)} ${args.targetUnit}`
      );
    } else {
      console.log(response.choices[0].message.content);
    }

    askQuestion(); // 🔁 Ask again instead of closing
  });
}

askQuestion();