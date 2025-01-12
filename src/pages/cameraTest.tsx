import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import client from "@/lib/client";
import { parseImage } from "@/lib/parseText";
import { takePhotoFromStream } from "@/lib/takePhotoFromStream";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaRegTrashCan } from "react-icons/fa6";

import { useEventListener } from "usehooks-ts";
import { createReadStream } from "fs";
function CameraTest() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<
    string | undefined
  >();
  const [image, setImage] = useState<string | undefined>();
  const [imageCrop, setImageCrop] = useState<string | undefined>();
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(70);
  const [x, setX] = useState(150);
  const [y, setY] = useState(290);
  const [set, setSet] = useState("");
  const [cNum, setCNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [scryfallID, setScryfallID] = useState("");
  const [cards, setCards] = useState<
    {
      scryfallID: string;
      setCode: string;
      cardName: string;
      cardNumber: string;
    }[]
  >([]);

  useEffect(() => {
    // Fetch available video devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId); // Default to the first device
      }
    });
  }, []);

  const webcamRef = useRef<Webcam>(null);
  async function capture(ocr = true, scryfall = true, add = false) {
    setSet("");
    setCNum("");
    setScryfallID("");
    setCardName("");
    console.log(webcamRef);
    if (webcamRef?.current) {
      if (selectedDeviceId && webcamRef.current?.stream) {
        console.log(width);
        const imageSrc = await takePhotoFromStream(webcamRef.current.stream, {
          width,
          height,
          x,
          y,
        });
        console.log(imageSrc);
        setImage(imageSrc.main);
        setImageCrop(imageSrc.crop);
        if (!ocr) return;
        const output = await parseImage(imageSrc.crop as any);
        setSet(output.setCode || "");
        setCNum(output.number || "");
        if (!scryfall) return;
        const { data } = await client.get(
          `/cards/${output.setCode}/${Number(output.number)}`
        );
        setCardName(data.name);
        setScryfallID(data.id);
        console.log(data);
        if (!add) return;
        if (data.id) {
          setCards([
            {
              scryfallID: data.id,
              cardName: data.name,
              setCode: output.setCode || "",
              cardNumber: output.number,
            },
            ...cards,
          ]);
          navigator.clipboard.writeText(
            `scryfall id
${cards.map((x) => x.scryfallID).join("\n")}`
          );
        }
      } else {
        console.log("failed test 2", selectedDeviceId);
      }
    }
  }

  const testCapture = () => {
    capture();
  };

  useEffect(() => {
    capture(false);
    const timeoutId = setTimeout(() => {
      capture();
    }, 100); // Adjust the delay as needed

    return () => {
      clearTimeout(timeoutId);
    };
  }, [width, height, x, y]);
  function addCard() {
    capture(true, true, true);
  }

  useEventListener("keypress", (e) => {
    if (e.key === " ") {
      addCard();
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      
      if(e.target == document.body) {
        e.preventDefault();
      }
    }
  });

  if (devices.length < 0) {
    return <p>No Cameras Found</p>;
  }
  return (
    <div className="w-screen h-full flex flex-col">
      <h1>Webcam Selector</h1>
      <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Camera" />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => {
            // console.log(device);
            return (
              <SelectItem value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <div className="w-full flex flex-row gap-2">
        <div className="flex flex-col w-1/4">
          <Webcam
            videoConstraints={{
              deviceId: selectedDeviceId,
            }}
            forceScreenshotSourceSize
            screenshotFormat="image/png"
            ref={webcamRef}
            style={{ width: "100%", maxWidth: "500px" }}
          />
          <Button onClick={testCapture}>Take Test Screenshot</Button>
        </div>
        {image ? <img src={image} className="object-contain h-[80%]" /> : null}
        <div className="w-1/4">
          {imageCrop ? (
            <img src={imageCrop} className="object-contain" />
          ) : null}
          <p>Set Code: {set}</p>
          <p>Collector Number: {cNum}</p>
          <p>Card Name: {cardName}</p>
          <p>Scryfall ID: {scryfallID}</p>
        </div>
        <div className="w-1/4 flex flex-col gap-2 pr-16">
          Width:
          <Input
            value={width}
            onChange={(e) => {
              setWidth(parseInt(e.target.value));
            }}
            type="number"
          />
          Height:
          <Input
            value={height}
            onChange={(e) => {
              setHeight(parseInt(e.target.value));
            }}
            type="number"
          />
          X:
          <Input
            value={x}
            onChange={(e) => {
              setX(parseInt(e.target.value));
            }}
            type="number"
          />
          Y:
          <Input
            value={y}
            onChange={(e) => {
              setY(parseInt(e.target.value));
            }}
            type="number"
          />
        </div>
      </div>
      <div className="w-full flex flex-row gap-2">
        <div className="flex flex-col gap-2">
          <Button onClick={addCard}>Add Card</Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `scryfall id
${cards.map((x) => x.scryfallID).join("\n")}`
              );
            }}
          >
            Copy Scryfall IDs To Clipboard
          </Button>
        </div>
        <div className="w-3/4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead className="w-[100px]">Set Code</TableHead>
                <TableHead className="w-[100px]">Set Number</TableHead>
                <TableHead>Card Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((x, i) => (
                <TableRow>
                  <TableCell>
                    <Button
                      onClick={() => {
                        cards.splice(i, 1);
                        setCards([...cards]);
                      }}
                    >
                      <FaRegTrashCan />
                    </Button>
                  </TableCell>
                  <TableCell>{x.setCode}</TableCell>
                  <TableCell>{x.cardNumber}</TableCell>
                  <TableCell>{x.cardName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
export default CameraTest;
