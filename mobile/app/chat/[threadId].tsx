import ChatThreadScreen from "@/src/features/mensajeria/screens/ChatThreadScreen";
import { useLocalSearchParams } from "expo-router";

export default function ChatThreadRoute() {
  const { threadId, title } = useLocalSearchParams<{
    threadId: string;
    title?: string;
  }>();

  return (
    <ChatThreadScreen threadId={threadId} title={title ?? "Chat"} />
  );
}
