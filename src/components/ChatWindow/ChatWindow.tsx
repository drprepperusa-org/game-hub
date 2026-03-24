import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useChatSocket } from '@/hooks/useChatSocket';
import styles from './ChatWindow.module.scss';

interface Props {
  onClose?: () => void;
}

const ChatWindow: React.FC<Props> = ({ onClose }) => {
  const { messages, resetUnread } = useChatStore();
  const { sendMessage } = useChatSocket();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetUnread();
  }, [resetUnread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>💬 Chat</span>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        )}
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>No messages yet. Say hi! 👋</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={styles.message}>
            <span className={styles.msgAvatar}>{msg.avatar}</span>
            <div className={styles.msgContent}>
              <span className={styles.msgUser}>{msg.username}</span>
              <span className={styles.msgText}>{msg.text}</span>
            </div>
            <span className={styles.msgTime}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          maxLength={200}
        />
        <button className={styles.sendBtn} onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
