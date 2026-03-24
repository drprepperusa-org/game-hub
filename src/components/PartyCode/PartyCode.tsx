import React, { useState } from 'react';
import styles from './PartyCode.module.scss';

interface Props {
  code: string;
}

const PartyCode: React.FC<Props> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>Room Code</span>
      <div className={styles.codeWrap}>
        <span className={styles.code}>{code}</span>
        <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
    </div>
  );
};

export default PartyCode;
