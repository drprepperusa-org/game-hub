import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket } from '@/lib/socket';
import { usePartyStore } from '@/stores/partyStore';
import { useAuthStore, AVATARS } from '@/stores/authStore';
import styles from './Lobby.module.scss';

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [joinCode, setJoinCode] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { setRoomCode, setIsConnecting, setError, error } = usePartyStore();
  const { username, avatar, setUsername, setAvatar } = useAuthStore();

  const handleCreate = useCallback(() => {
    const uname = inputUsername.trim() || username;
    if (!uname) { setLocalError('Enter your name first!'); return; }

    setUsername(uname);
    setAvatar(AVATARS[selectedAvatar]);
    setIsLoading(true);
    setLocalError('');

    const socket = connectSocket();
    const roomCode = generateRoomCode();

    socket.once('connect', () => {
      socket.emit('join-party', { roomCode, username: uname, avatar: AVATARS[selectedAvatar] });
    });

    socket.once('player-joined', () => {
      setRoomCode(roomCode);
      setIsConnecting(false);
      setIsLoading(false);
      navigate('/party');
    });

    socket.once('error', (data: { message: string }) => {
      setError(data.message);
      setIsLoading(false);
    });

    if (socket.connected) {
      socket.emit('join-party', { roomCode, username: uname, avatar: AVATARS[selectedAvatar] });
    }

    setIsConnecting(true);
  }, [inputUsername, username, selectedAvatar, navigate, setRoomCode, setIsConnecting, setError, setUsername, setAvatar]);

  const handleJoin = useCallback(() => {
    const uname = inputUsername.trim() || username;
    const code = joinCode.trim().toUpperCase();
    if (!uname) { setLocalError('Enter your name first!'); return; }
    if (code.length < 4) { setLocalError('Enter a valid room code!'); return; }

    setUsername(uname);
    setAvatar(AVATARS[selectedAvatar]);
    setIsLoading(true);
    setLocalError('');

    const socket = connectSocket();

    const onJoined = () => {
      setRoomCode(code);
      setIsConnecting(false);
      setIsLoading(false);
      navigate('/party');
    };

    const onError = (data: { message: string }) => {
      setError(data.message);
      setLocalError(data.message);
      setIsLoading(false);
    };

    socket.once('player-joined', onJoined);
    socket.once('error', onError);

    const doJoin = () => {
      socket.emit('join-party', { roomCode: code, username: uname, avatar: AVATARS[selectedAvatar] });
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once('connect', doJoin);
    }

    setIsConnecting(true);
  }, [inputUsername, username, joinCode, selectedAvatar, navigate, setRoomCode, setIsConnecting, setError, setUsername, setAvatar]);

  return (
    <div className={styles.lobby}>
      {/* Security Warning */}
      <div className={styles.warningBanner}>
        🚨 <strong>NO SECURITY</strong> — Don't use real passwords or personal info!
      </div>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoWrap}>
            <span className={styles.logoIcon}>🎮</span>
            <h1 className={styles.logoText}>GAME HUB</h1>
          </div>
          <p className={styles.tagline}>Multiplayer mini-games for parties!</p>
          <div className={styles.floatingEmojis}>
            {['🦛', '🎯', '🧠', '🏆', '⚡', '🎉'].map((e, i) => (
              <span key={i} className={styles.floatingEmoji} style={{ animationDelay: `${i * 0.3}s` }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        {mode === 'home' && (
          <div className={styles.homeButtons}>
            <button className={styles.btnCreate} onClick={() => setMode('create')}>
              🎊 Create Party
            </button>
            <button className={styles.btnJoin} onClick={() => setMode('join')}>
              🚪 Join Party
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className={styles.form}>
            <button className={styles.backBtn} onClick={() => { setMode('home'); setLocalError(''); }}>
              ← Back
            </button>

            <h2 className={styles.formTitle}>
              {mode === 'create' ? '🎊 Create Party' : '🚪 Join Party'}
            </h2>

            {/* Avatar picker */}
            <div className={styles.avatarSection}>
              <label className={styles.label}>Pick your avatar</label>
              <div className={styles.avatarGrid}>
                {AVATARS.map((a, i) => (
                  <button
                    key={i}
                    className={`${styles.avatarBtn} ${selectedAvatar === i ? styles.avatarSelected : ''}`}
                    onClick={() => setSelectedAvatar(i)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Your name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter your name..."
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'create' ? handleCreate() : handleJoin())}
              />
            </div>

            {/* Room code for join */}
            {mode === 'join' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Room code</label>
                <input
                  className={`${styles.input} ${styles.inputCode}`}
                  type="text"
                  placeholder="ABCD12"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
              </div>
            )}

            {(localError || error) && (
              <div className={styles.errorMsg}>⚠️ {localError || error}</div>
            )}

            <button
              className={styles.btnSubmit}
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loadingInner}>
                  <span className={styles.spinnerSm} /> Connecting...
                </span>
              ) : mode === 'create' ? '🎊 Create Room' : '🚀 Join Room'}
            </button>
          </div>
        )}
      </div>

      <div className={styles.gamePreview}>
        {[
          { icon: '🦛', name: 'Hippo Frenzy', desc: 'Tap the hippos fastest!' },
          { icon: '🎯', name: 'Jeopardy', desc: 'Answer & earn points' },
          { icon: '⚡', name: 'Trivia Battle', desc: 'Speed + accuracy wins' },
        ].map((g) => (
          <div key={g.name} className={styles.previewCard}>
            <span className={styles.previewIcon}>{g.icon}</span>
            <strong>{g.name}</strong>
            <span>{g.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
