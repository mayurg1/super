import { useParams } from 'react-router-dom';
import { ChatList } from './ChatList';
import { ChatThread } from './ChatThread';

export function ChatPage(): React.ReactElement {
  const { conversationId } = useParams<{ conversationId?: string }>();
  if (conversationId) return <ChatThread conversationId={conversationId} />;
  return (
    <div className="sc-chat">
      <h2 className="sc-chat-title">Messages</h2>
      <ChatList />
    </div>
  );
}