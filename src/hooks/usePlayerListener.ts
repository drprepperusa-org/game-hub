import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { usePartyStore } from '@/stores/partyStore';
import type { Player } from '@/types';

export const usePlayerListener = (onJoin?: (player: Player) => void, onLeave?: (playerId: string) => void) => {
  const { setPlayers } = usePartyStore();

  useEffect(() => {
    const socket = getSocket();

    const handleJoined = (data: { players: Player[] }) => {
      setPlayers(data.players);
      if (onJoin) {
        const latest = data.players[data.players.length - 1];
        if (latest) onJoin(latest);
      }
    };

    const handleLeft = (data: { players: Player[]; leftId: string }) => {
      setPlayers(data.players);
      if (onLeave && data.leftId) onLeave(data.leftId);
    };

    socket.on('player-joined', handleJoined);
    socket.on('player-left', handleLeft);

    return () => {
      socket.off('player-joined', handleJoined);
      socket.off('player-left', handleLeft);
    };
  }, [setPlayers, onJoin, onLeave]);
};
