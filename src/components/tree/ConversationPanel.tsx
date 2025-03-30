import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, User, Sparkles, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, Node } from "@/types/tree";
import { generateInitialMessages } from "@/lib/conversation-generator";
import { chatWithAI } from "@/api/webhook";
import { getFromLocalStorage } from "@/utils/localStorage";
import { chapters, DataChapter } from "@/types/tree";

const ChatMessage = forwardRef<HTMLDivElement, { message: Message }>((props, ref) => {
  const { message } = props;
  const isAI = message.sender === "ai";

  return (
    <motion.div
      ref={ref}
      className={`flex gap-3 px-3 py-2 ${isAI ? "" : "flex-row-reverse"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>{isAI ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col gap-1.5 ${isAI ? "items-start" : "items-end"}`}>
        <div className={`rounded-lg px-4 py-2.5 ${isAI ? "bg-secondary/80" : "bg-primary text-primary-foreground"}`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <span className="text-[11px] text-muted-foreground/80 px-1">{message.timestamp}</span>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";

interface ConversationPanelProps {
  node: Node;
  messages?: Message[];
  onComplete: () => void;
  onBack: () => void;
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ConversationPanel = ({
  node,
  messages: externalMessages,
  onComplete,
  onBack,
  onSendMessage,
  isLoading: externalLoading = false,
  disabled = false
}: ConversationPanelProps) => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = externalMessages || localMessages;
  const isLoading = externalLoading || localLoading;

  useEffect(() => {
    if (!externalMessages) {
      const initialMessages = generateInitialMessages(node);
      setLocalMessages(initialMessages);
    }
  }, [node, externalMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    const DataChapter = getFromLocalStorage("courseData", null);
    const chapterContent = DataChapter.chapters.find((chap: chapters) => chap.id === node.id)?.content ?? "null";

    let systemPrompt = "System: Tu es un professeur qui doit expliquer et aider l'utilisateur à l'apprendre.";

    if (node.id === "root") {
      systemPrompt += ` Voici l’introduction générale du cours. Sois clair, bienveillant et pédagogique. Contenu du cours : ${JSON.stringify(DataChapter, null, 2)}`;
    } else {
      systemPrompt += ` Voici le contenu du chapitre : ${JSON.stringify(chapterContent, null, 2)}`;
    }
    
    const conversationHistoryString = [
      systemPrompt,
      ...localMessages.map(message =>
        `${message.sender === "user" ? "User" : "Assistant"}: ${message.content}`
      )
    ].join("\n");

    if (!input.trim() || isLoading || disabled) return;

    if (onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInput("");
    setLocalLoading(true);

    try {
      const response = await chatWithAI(conversationHistoryString, userMessage.content);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: response,
        timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
      };

      setLocalMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLocalLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-3 sm:px-6 pb-1.5 pt-4 sm:pt-6 relative">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-row items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-medium flex-1 pr-2">{node.title}</h2>
        <Button
          variant="secondary"
          className="shrink-0 h-7 px-2.5 bg-black text-white rounded-full text-[11px] font-medium"
          onClick={() => onComplete()}
        >
          Valider le chapitre
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 -mx-2">
        <AnimatePresence mode="popLayout">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>En réflexion...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center"
            onClick={onBack}
          >
        <svg viewBox="0 0 852 852" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_83_1109)">
              <circle cx="426" cy="426" r="386" fill="#C7D7F6"/>
            </g>
            <path d="M411.343 74.2024C378.427 197.046 608.874 324.472 575.958 447.316C543.042 570.159 243.93 596.32 211.014 719.164"
              stroke="currentColor"
              strokeWidth="29.3164"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeDasharray="48.86 48.86"
            />
            <circle
              cx="576.586"
              cy="440.131"
              r="81.4881"
              transform="rotate(15 576.586 440.131)"
              fill="currentColor"
            />
            <defs>
              <filter
                id="filter0_d_83_1109"
                x="0.911907"
                y="0.911419"
                width="850.177"
                height="850.177"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset/>
                <feGaussianBlur stdDeviation="19.5443"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_83_1109"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_83_1109" result="shape"/>
              </filter>
            </defs>
          </svg>
        </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ecrivez votre message..."
            className="resize-none text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3rem] py-2"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
