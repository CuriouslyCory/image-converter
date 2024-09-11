"use client";

import React, { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";
import CopyText from "~/components/ui/copy-text";

interface Attribute {
  trait_type: string;
  value: string | number;
  display_type?:
    | "string"
    | "boost_number"
    | "boost_percentage"
    | "number"
    | "date";
}

interface NFTMetadata {
  description: string;
  image: string;
  name: string;
  attributes: Attribute[];
}

export default function NFTMetadataBuilder() {
  const [metadata, setMetadata] = useState<NFTMetadata>({
    description: "",
    image: "",
    name: "",
    attributes: [],
  });

  const [jsonDataUri, setJsonDataUri] = useState("");

  useEffect(() => {
    const jsonString = JSON.stringify(metadata, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    setJsonDataUri(dataUri);
  }, [metadata]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const addAttribute = () => {
    setMetadata((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: "", value: "" }],
    }));
  };

  const removeAttribute = (index: number) => {
    setMetadata((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleAttributeChange = (
    index: number,
    field: keyof Attribute,
    value: string,
  ) => {
    setMetadata((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr,
      ),
    }));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">NFT Metadata Builder</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={metadata.name}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={metadata.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            name="image"
            value={metadata.image}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Attributes</h2>
          <Button onClick={addAttribute} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        {metadata.attributes.map((attr, index) => (
          <div key={index} className="flex items-end space-x-2">
            <div className="flex-1">
              <Label htmlFor={`trait_type_${index}`}>Trait Type</Label>
              <Input
                id={`trait_type_${index}`}
                value={attr.trait_type}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAttributeChange(index, "trait_type", e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`value_${index}`}>Value</Label>
              <Input
                id={`value_${index}`}
                value={attr.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAttributeChange(index, "value", e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`display_type_${index}`}>Display Type</Label>
              <Select
                value={attr.display_type ?? ""}
                onValueChange={(value) =>
                  handleAttributeChange(index, "display_type", value)
                }
              >
                <SelectTrigger id={`display_type_${index}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boost_number">Boost Number</SelectItem>
                  <SelectItem value="boost_percentage">
                    Boost Percentage
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeAttribute(index)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">Generated JSON</h2>
        <CopyText value={jsonDataUri} />
      </div>
    </div>
  );
}
