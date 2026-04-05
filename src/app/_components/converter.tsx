"use client";
import { DownloadIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import CopyText from "~/components/ui/copy-text";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Slider } from "~/components/ui/slider";
import { api } from "~/trpc/react";

type ConversionType = "webp" | "ico" | "png" | "jpeg";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

interface FileWithId {
  id: string;
  file: File;
}

interface ConvertedImage {
  id: string;
  src: string;
  originalName: string;
}

interface ConverterComponentProps {
  headingLevel?: "h1" | "h2";
}

export default function ConverterComponent({
  headingLevel: Heading = "h1",
}: ConverterComponentProps) {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [base64, setBase64] = useState<string>("");
  const [conversionType, setConversionType] = useState<ConversionType>("webp");
  const [quality, setQuality] = useState(80);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);

  const convertImageMutation = api.convert.convertImage.useMutation();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(reader.error?.message));
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selected = Array.from(event.target.files);
      const invalid = selected.filter(
        (f) => !ALLOWED_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE,
      );
      if (invalid.length > 0) {
        toast.error(
          "Some files were rejected. Max size: 10MB. Allowed types: PNG, JPEG, GIF, WebP, BMP, TIFF, SVG.",
        );
      }
      const valid = selected
        .filter(
          (f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE,
        )
        .map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
        }));
      setFiles(valid);
    }
  };

  const convertImages = async () => {
    try {
      const converted = await Promise.all(
        files.map(async (fileWithId) => {
          const b64 = await fileToBase64(fileWithId.file);
          const result = await convertImageMutation.mutateAsync({
            image: b64,
            format: conversionType,
            quality: conversionType === "webp" ? quality : undefined,
          });
          return {
            id: fileWithId.id,
            src: result,
            originalName: fileWithId.file.name,
          };
        }),
      );
      setConvertedImages(converted);

      const base64Strings = await Promise.all(
        files.map((f) => fileToBase64(f.file)),
      );
      setBase64(base64Strings.join("\n"));

      toast.success(`Successfully converted ${converted.length} image(s)`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to convert images. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-border bg-card text-card-foreground p-4 sm:p-6 shadow-sm">
      <Heading className="mb-4 text-2xl font-bold text-primary">Image Converter</Heading>
      <div className="mb-4">
        <Label htmlFor="file-upload" className="sr-only">Choose image files</Label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
        />
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <p>Selected files:</p>
          <ul>
            {files.map((fileWithId) => (
              <li key={fileWithId.id}>{fileWithId.file.name}</li>
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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="png" id="png" />
            <Label htmlFor="png">PNG</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="jpeg" id="jpeg" />
            <Label htmlFor="jpeg">JPEG</Label>
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
        disabled={convertImageMutation.isPending || files.length === 0}
      >
        {convertImageMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          "Convert"
        )}
      </Button>
      {files.length === 0 && convertedImages.length === 0 && (
        <div className="mt-6 rounded-md border border-dashed border-primary/30 bg-accent/30 p-8 text-center">
          <p className="text-muted-foreground">
            Upload one or more images to convert them to your desired format.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Supported: PNG, JPEG, GIF, WebP, BMP, TIFF, SVG (max 10MB each)
          </p>
        </div>
      )}
      <div aria-busy={convertImageMutation.isPending} aria-live="polite">
        {convertedImages.length > 0 && (
          <div className="mt-4">
            <p>Converted Images:</p>
            <div className="grid grid-cols-2 gap-2">
              {convertedImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.src}
                    alt={`${img.originalName} converted to ${conversionType}`}
                    className="h-auto max-h-64 w-full rounded object-contain"
                  />
                  <a
                    href={img.src}
                    download={`${img.originalName.split(".")[0]}.${conversionType}`}
                    className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    aria-label={`Download ${img.originalName}`}
                    rel="noopener noreferrer"
                  >
                    <DownloadIcon size={20} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        {base64.length > 0 && (
          <div className="mt-6">
            <Label>Base64</Label>
            <CopyText value={base64}></CopyText>
          </div>
        )}
      </div>
    </div>
  );
}
