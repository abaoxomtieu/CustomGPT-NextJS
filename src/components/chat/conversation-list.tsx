import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, MessageCircle, Plus, Trash } from "lucide-react";

interface ConversationMeta {
  conversation_id: string;
  name: string;
  created_at: number;
}

interface ConversationListProps {
  conversations: ConversationMeta[];
  currentConversationId: string;
  isSidebarCollapsed: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateConversation: () => void;
  onToggleSidebar: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  isSidebarCollapsed,
  onSelectConversation,
  onDeleteConversation,
  onCreateConversation,
  onToggleSidebar,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!isSidebarCollapsed && (
          <span className="text-sm font-medium text-gray-700">
            Conversations
          </span>
        )}
        <Button
          variant="ghost"
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-blue-600"
        >
          {isSidebarCollapsed ? <Menu /> : <Menu />}
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {!isSidebarCollapsed && (
            <Button
              variant="default"
              onClick={onCreateConversation}
              size="sm"
              className="w-full bg-foreground hover:bg-foreground/80  text-background border-none flex items-center gap-2"
            >
              <Plus /> New Conversation
            </Button>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                currentConversationId === conv.conversation_id
                  ? "bg-foreground/10 text-foreground"
                  : "hover:bg-foreground/10 text-foreground"
              }`}
              onClick={() => onSelectConversation(conv.conversation_id)}
            >
              <MessageCircle className="text-lg" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 text-sm font-medium truncate">
                    {conv.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.conversation_id);
                    }}
                    className="p-1 hover:bg-red-50"
                  >
                    <Trash />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
