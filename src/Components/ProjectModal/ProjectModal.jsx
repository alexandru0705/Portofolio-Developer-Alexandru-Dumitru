import React, { useState } from 'react';
import styles from './ProjectModal.module.css';

function ProjectModal({ project, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!project) return null;

    const images = project.images || [];

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                
                <h2>{project.title}</h2>
                <p className={styles.category}>{project.category}</p>
                
                <div className={styles.carousel}>
                    {images.length > 1 && (
                        <button className={`${styles.navBtn} ${styles.prev}`} onClick={handlePrev}>‹</button>
                    )}
                    
                    <img 
                        src={images[currentIndex]} 
                        alt={`${project.title} slide ${currentIndex + 1}`} 
                        className={styles.carouselImage} 
                    />
                    
                    {images.length > 1 && (
                        <button className={`${styles.navBtn} ${styles.next}`} onClick={handleNext}>›</button>
                    )}
                    
                    <span className={styles.counter}>{currentIndex + 1} / {images.length}</span>
                </div>

                <p className={styles.description}>{project.description}</p>

                <div className={styles.links}>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.btn}>
                        GitHub Repository ↗
                    </a>
                    {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.btn}>
                            Live Site ↗
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProjectModal;