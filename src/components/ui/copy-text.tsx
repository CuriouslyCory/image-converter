"use client";

import React, { useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";

interface ReadOnlyTextAreaProps {
  value: string;
}

export default function CopyText({ value }: ReadOnlyTextAreaProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        readOnly
        className="min-h-[100px] resize-none pr-10"
      />
      <Button
        onClick={copyToClipboard}
        className="absolute right-2 top-2 h-8 w-8 p-0"
        variant="ghost"
        size="icon"
      >
        {isCopied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isCopied ? "Copied" : "Copy to Clipboard"}
        </span>
      </Button>
    </div>
  );
}
