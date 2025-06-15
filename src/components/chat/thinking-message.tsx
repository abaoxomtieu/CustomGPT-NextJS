import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ThinkingMessageProps {
  thinking: string;
}

const ThinkingMessage: React.FC<ThinkingMessageProps> = ({ thinking }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-muted/50 rounded-lg overflow-hidden">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 hover:bg-muted/70"
            >
              <span className="text-sm text-muted-foreground">Thinking...</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap">
              {thinking}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default ThinkingMessage; 