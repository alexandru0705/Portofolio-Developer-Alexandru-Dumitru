import React from 'react';
import styles from './ProjectCard.module.scss';

function ProjectCard({ project, onOpenModal }) {
    return (
        <article className={styles.card} onClick={() => onOpenModal(project)}>
            <div className={styles.imageContainer}>
                <img 
                    src={project.images[0]} 
                    alt={project.title} 
                    className={styles.thumbnail} 
                />
            </div>
            <div className={styles.content}>
                <span className={styles.category}>{project.category}</span>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.description}>{project.description}</p>
                <div className={styles.tagsContainer}>
                    {project.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
        </article>
    );
}

export default ProjectCard;