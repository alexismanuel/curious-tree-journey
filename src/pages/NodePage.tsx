import { useCallback, useState } from "react";
import { NodeConversation } from "@/components/node/NodeConversation";
import { Node } from "@/types/tree";

type Message = {
  content: string;
  isUser: boolean;
};

export const NodePage = ({ node }: { node: Node }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "je galère avec les barrés, j'ai pas assez de force.",
      isUser: true,
    },
    {
      content: "C'est normal au début ! Assure-toi que ton pouce est bien placé derrière le manche, pas trop haut. Et applique juste assez de pression, sans crisper la main. Tu joues quel accord ?",
      isUser: false,
    },
    {
      content: "Un Fa majeur, ça frise...",
      isUser: true,
    },
    {
      content: "Essaye de bien positionner ton index, légèrement incliné sur le côté, plutôt que complètement à plat. Fais sonner corde par corde pour voir où ça coince.",
      isUser: false,
    },
    {
      content: "Ah ouais, la 2e corde étouffe...",
      isUser: true,
    },
    {
      content: "Ça vient sûrement de la pression insuffisante ou de la position de ton doigt. Ajuste légèrement et presse un peu plus avec l'index. Si ça fatigue trop vite, fais des pauses et reviens-y régulièrement, la force viendra avec le temps !",
      isUser: false,
    },
  ]);

  const handleSendMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { content, isUser: true }]);
    // Here you would typically trigger the AI response
  }, []);

  return (
    <div className="h-screen bg-white">
      <NodeConversation
        node={node}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};
