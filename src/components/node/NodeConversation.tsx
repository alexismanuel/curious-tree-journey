import { Node } from "@/types/tree";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  content: string;
  isUser: boolean;
};

export const NodeConversation = ({
  node,
  messages = [],
  onSendMessage,
}: {
  node: Node;
  messages: Message[];
  onSendMessage: (message: string) => void;
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
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-lg font-medium text-center mb-3">{node.title}</h1>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i === 4 ? "bg-black" : "bg-gray-300"
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
            <p className="text-sm leading-relaxed">{message.content}</p>
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
