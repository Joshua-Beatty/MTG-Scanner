import sets from "@/constants/sets";
import { parseText } from "./parseText";
import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_KEY || "";

const apiKey = API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig: GenerationConfig = {
  temperature: 0.1,
  topP: 1,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    "type": "object",
    "properties": {
      "strings_and_nums": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "symbol": {
        "type": "boolean"
      }
    },
    "required": ["strings_and_nums", "symbol"]
  },
} as any;

export async function parseImageAI(dataUrl: string) {
  console.log("parse image ai");

  const dataURLParts = dataUrl.split(",");
  const mimeType = dataURLParts[0]?.match(/:(.*?);/)?.[1] as string;
  console.log(mimeType);
  const imgdata = dataURLParts[1];
  const output = await model.generateContent({
    generationConfig,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imgdata,
              mimeType: mimeType,
            },
          },
          {
            text: "List all numbers and all three character strings you see in this image. Also return if you see a white symbol with 5 points in the bottom left fn a black background. Return false if there is only text.",
          },
        ],
        role: "user",
      },
    ],
  });
  const text = output.response.text()
  console.log(text);
  const data = JSON.parse(text)
  const strings = (data.strings_and_nums as string[])
    .map((x: string) => x.split(" "))
    .flat(2);
  console.log(strings);
  let set_code = "";
  let collector_number;
  for (const s of strings) {
    for (const set of sets) {
      if (s == set) {
        set_code = set;
        break;
      }
    }
    const num = parseInt(s);
    if (!Number.isNaN(num)) {
      if (!collector_number) collector_number = num;
    //   if (num < collector_number) collector_number = num;
    }
  }
  if (!set_code)
    for (const s of strings) {
      if (set_code) break;
      for (const set of sets) {
        if (s.includes(set)) {
          set_code = set;
        }
      }
    }
  console.log(set_code, collector_number);
  if(data.symbol)
    return {set_code: "plst", collector_number: `${set_code}-${collector_number}`}

  return { set_code, collector_number} as any;
}
