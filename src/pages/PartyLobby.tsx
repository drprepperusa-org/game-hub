import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyStore } from '@/stores/partyStore';
import { useChatStore } from '@/stores/chatStore';
import { usePartySocket } from '@/hooks/usePartySocket';
import PlayerList from '@/components/PlayerList/PlayerList';
import ChatWindow from '@/components/ChatWindow/ChatWindow';
import PartyCode from '@/components/PartyCode/PartyCode';
import styles from './PartyLobby.module.scss';

const PartyLobby: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode, players, isLeader, currentPlayerId, error } = usePartyStore();

  const { leaveParty } = usePartySocket();
  const { messages } = useChatStore();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!roomCode) navigate('/');
  }, [roomCode, navigate]);

  const handleLeave = () => {
    leaveParty();
    usePartyStore.getState().reset();
    navigate('/');
  };

  const handleStartGame = () => {
    navigate('/select-game');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.leaveBtn} onClick={handleLeave}>← Leave</button>
        <div className={styles.headerCenter}>
          <span className={styles.headerTitle}>Party Lobby</span>
          <PartyCode code={roomCode} />
        </div>
        <div className={styles.chatToggle}>
          <button
            className={`${styles.chatToggleBtn} ${showChat ? styles.active : ''}`}
            onClick={() => setShowChat(!showChat)}
          >
            💬 {messages.length > 0 && <span className={styles.badge}>{messages.length}</span>}
          </button>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.leftPanel}>
          <div className={styles.playerSection}>
            <h2 className={styles.sectionTitle}>
              Players <span className={styles.count}>{players.length}/8</span>
            </h2>
            <PlayerList players={players} currentPlayerId={currentPlayerId} />
          </div>

          {error && <div className={styles.error}>⚠️ {error}</div>}

          <div className={styles.waitingArea}>
            <div className={styles.waitingDots}>
              <span>Waiting for players</span>
              <span className={styles.dot}>.</span>
              <span className={styles.dot} style={{ animationDelay: '0.3s' }}>.</span>
              <span className={styles.dot} style={{ animationDelay: '0.6s' }}>.</span>
            </div>
          </div>

          {isLeader ? (
            <button className={styles.startBtn} onClick={handleStartGame} disabled={players.length < 1}>
              🎮 Start Game
            </button>
          ) : (
            <div className={styles.waitingForLeader}>
              <span>Waiting for {players.find(p => p.isLeader)?.username || 'leader'} to start...</span>
            </div>
          )}
        </div>

        {showChat && (
          <div className={styles.chatPanel}>
            <ChatWindow onClose={() => setShowChat(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyLobby;
