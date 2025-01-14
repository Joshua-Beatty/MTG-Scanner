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
  if(!setCode){
    for (const set of sets) {
      if (cardText.includes(set)) {
        setCode = set;
        break;
      }
    }
  }
  const out = /(\d\d\d)\/\d\d\d|(\d\d\d\d)/.exec(cardText) as any;
  console.log(cardText, out);
  number = out[1] || out[2];
  if (!setCode || !number) return { success: false };
  return { setCode, number, success: true };
}

export async function parseImage(imageLike: any) {
  const worker = await createWorker("eng");
  await worker.setParameters({tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/"})
  let ret = await worker.recognize(imageLike, {rotateAuto: true}, {text: true});
  console.log(ret)
   ret = await worker.recognize(imageLike);
  // const ret2 = await worker.recognize(imageLike, {}, {blocks: true});
  console.log(ret)
  await worker.terminate();
  const text = ret.data.text;
  return parseText(text)
}

