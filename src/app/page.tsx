"use client";

import ReverseEngineering from '@/components/features/ReverseEngineering';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.mainContainer}>
      <ReverseEngineering />
    </main>
  );
}
