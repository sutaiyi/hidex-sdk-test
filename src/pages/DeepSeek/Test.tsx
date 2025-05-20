// TechPillars.tsx
import React from 'react';
import styles from './TechPillars.module.css';

const TechPillars = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Pillars Of Tech</h1>
        <p className={styles.subtitle}>
          Sapient Intelligence is drawing insights from the intersection of Machine Learning, Neuroscience, Mathematics and etc. to create a radically different AI architecture.
        </p>
      </header>

      <div className={styles.pillarsContainer}>
        {/* Pillar 1 */}
        <article className={styles.pillarCard}>
          <h2 className={styles.pillarTitle}>Brain-Inspired Architecture</h2>
          <p className={styles.pillarDescription}>Isabelle Compere has becoming & Herming Who’d already.</p>
        </article>

        {/* Pillar 2 */}
        <article className={styles.pillarCard}>
          <h2 className={styles.pillarTitle}>Combining RL & Meta-Learning</h2>
          <p className={styles.pillarDescription}>Allowed Models in Group Forwarding Table All Scale.</p>
        </article>

        {/* Pillar 3 */}
        <article className={styles.pillarCard}>
          <h2 className={styles.pillarTitle}>Evolutionary Training Process</h2>
          <p className={styles.pillarDescription}>Allows Business Of Training Coach at Node Performance</p>
        </article>
      </div>
    </div>
  );
};

export default TechPillars;
