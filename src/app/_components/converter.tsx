"use client";
import { DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import CopyTextComponent from "~/components/ui/copy-text";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Slider } from "~/components/ui/slider";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

type ConversionType = "webp" | "ico";

export default function ConverterComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [base64, setBase64] = useState<string>("");
  const [conversionType, setConversionType] = useState<ConversionType>("webp");
  const [quality, setQuality] = useState(80);
  const [convertedImages, setConvertedImages] = useState<string[]>([]);

  const convertImageMutation = api.convert.convertImage.useMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const convertImages = async () => {
    const converted = await Promise.all(
      files.map(async (file) => {
        const base64 = await fileToBase64(file);
        const result = await convertImageMutation.mutateAsync({
          image: base64,
          format: conversionType,
          quality: conversionType === "webp" ? quality : undefined,
        });
        return result;
      }),
    );
    setConvertedImages(converted);
  };

  useEffect(() => {
    const base64Files = files.map(async (file) => {
      return await fileToBase64(file);
    });
    Promise.all(base64Files)
      .then((base64) => {
        setBase64(base64.join("\n"));
      })
      .catch((error) => {
        console.error(error);
      });
  }, [files]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(reader.error?.message));
    });
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Image Converter</h1>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="file:bg-primary hover:file:bg-primary/80 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <p>Selected files:</p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4">
        <Label>Conversion Type</Label>
        <RadioGroup
          value={conversionType}
          onValueChange={(value) => setConversionType(value as ConversionType)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="webp" id="webp" />
            <Label htmlFor="webp">WebP</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ico" id="ico" />
            <Label htmlFor="ico">ICO</Label>
          </div>
        </RadioGroup>
      </div>
      {conversionType === "webp" && (
        <div className="mt-4">
          <Label>Quality: {quality}%</Label>
          <Slider
            value={[quality]}
            onValueChange={(value) => setQuality(value[0] ?? 100)}
            min={1}
            max={100}
            step={1}
          />
        </div>
      )}
      <Button
        onClick={convertImages}
        className="mt-4"
        disabled={convertImageMutation.isPending}
      >
        {convertImageMutation.isPending ? "Converting..." : "Convert"}
      </Button>
      {convertedImages.length > 0 && (
        <div className="mt-4">
          <p>Converted Images:</p>
          <div className="grid grid-cols-2 gap-2">
            {convertedImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Converted ${index}`}
                  className="h-auto w-full rounded object-cover"
                />
                <a
                  href={img}
                  download={`converted-${index}.${conversionType}`}
                  className="absolute right-1 top-1 rounded-full bg-white p-1"
                >
                  <DownloadIcon size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      {base64.length > 0 && (
        <div className="mt-6">
          <Label>Base64</Label>
          <CopyTextComponent value={base64}></CopyTextComponent>
        </div>
      )}
    </div>
  );
}
