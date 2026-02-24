import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { convertUnits } from "./unitConverter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ THIS FIXES "Cannot GET /"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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

app.post("/convert", async (req, res) => {
  try {
    const { input } = req.body;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: input }],
      tools,
      tool_choice: "auto"
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = convertUnits(
        args.value,
        args.sourceUnit,
        args.targetUnit
      );

      return res.json({
        result: `${args.value} ${args.sourceUnit} is ${result.toFixed(2)} ${args.targetUnit}`
      });
    }

    res.json({ result: response.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
