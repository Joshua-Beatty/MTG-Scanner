import sets from "@/constants/sets";
import { createWorker } from "tesseract.js";

export async function parseText(cardText: string) {
  let setCode;
  let number;
  for (const set of sets) {
    if (cardText.includes("\n" + set + " ")) {
      setCode = set;
      break;
    }
  }
  if(!setCode){
    for (const set of sets) {
      if (cardText.includes(set + " ")) {
        setCode = set;
        break;
      }
    }
  }
  const out = /(\d\d\d)\/\d\d\d| (\d\d\d\d)/.exec(cardText) as any;
  console.log(cardText, out);
  number = out[1] || out[2];
  if (!setCode || !number) return { success: false };
  return { setCode, number, success: true };
}

export async function parseImage(imageLike: any) {
  const worker = await createWorker("eng");
  const ret = await worker.recognize(imageLike);
  await worker.terminate();
  const text = ret.data.text;
  return parseText(text)
}
