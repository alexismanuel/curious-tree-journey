import { Node } from "@/types/tree";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

type Message = {
  content: string;
  isUser: boolean;
};

export const NodeConversation = ({
  node,
  messages = [],
  onSendMessage,
  onBackToTree,
}: {
  node: Node;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onBackToTree: () => void;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    if (input.value.trim()) {
      onSendMessage(input.value);
      input.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-6 relative">
      {/* Header */}
      <div className="mb-8 relative">
        <h1 className="text-xl font-semibold text-center">{node.title}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={onBackToTree}
        >
          <Home className="h-5 w-5" />
        </Button>
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === 4 ? "bg-black scale-125" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-lg p-3",
              message.isUser
                ? "bg-gray-100 ml-auto"
                : "bg-transparent ml-0"
            )}
          >
            <p className="text-md leading-relaxed">{message.content}</p>
          </div>
        ))}
      </div>


      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-6">
        <Input
          name="message"
          placeholder="..."
          className="w-full rounded-full bg-gray-50 border-0"
        />
      </form>
    </div>
  );
};
