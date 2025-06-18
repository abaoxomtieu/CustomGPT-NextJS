"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudDownload } from "lucide-react";
import { EXTENSION_OPTIONS } from "@/constant";

interface RepositoryConfigProps {
  repoUrl: string;
  loading: boolean;
  selectedExtensions: string[];
  onRepoUrlChange: (url: string) => void;
  onExtensionChange: (extensions: string[]) => void;
  onFetchFiles: () => void;
}

export default function RepositoryConfig({
  repoUrl,
  loading,
  selectedExtensions,
  onRepoUrlChange,
  onExtensionChange,
  onFetchFiles,
}: RepositoryConfigProps) {
  // Handler for multi-select (simulate multi-select if needed)
  const handleSelectChange = (value: string) => {
    let newSelected: string[];
    if (selectedExtensions.includes(value)) {
      newSelected = selectedExtensions.filter((v) => v !== value);
    } else {
      newSelected = [...selectedExtensions, value];
    }
    onExtensionChange(newSelected);
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="space-y-3 p-4">
        <Input
          value={repoUrl}
          onChange={(e) => onRepoUrlChange(e.target.value)}
          placeholder="Enter GitHub repository URL"
          className="rounded-lg text-sm h-8"
          disabled={loading}
        />
        <div>
          <div className="mb-2 text-sm font-medium text-foreground">
            File extensions:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXTENSION_OPTIONS.map((opt, index) => (
              <Button
                key={index}
                variant={selectedExtensions.includes(opt.value) ? "default" : "outline"}
                size="sm"
                className={`h-6 px-2 text-xs rounded transition-colors ${
                  selectedExtensions.includes(opt.value) 
                    ? 'bg-foreground text-background hover:bg-foreground/90' 
                    : 'bg-background text-foreground border-foreground/20 hover:bg-foreground/5'
                }`}
                onClick={() => handleSelectChange(opt.value)}
                disabled={loading}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <Button
          size="sm"
          className="w-full bg-foreground text-background hover:bg-foreground/90 h-8 text-sm"
          onClick={onFetchFiles}
          disabled={loading}
        >
          <CloudDownload className="mr-2 w-3.5 h-3.5" />
          {loading ? "Cloning..." : "Clone Repository"}
        </Button>
      </CardContent>
    </Card>
  );
}
