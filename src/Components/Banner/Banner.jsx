import { useState } from 'react';
import './Banner.scss';

function Banner() {
  const [bioText] = useState('Salut Alex! Voici ton espace personnel.');

  return (
    <div className="text-viewer-container">
      <h2>Hello Everyone</h2>
      <div className="text-output">
        <p>{bioText}</p>
      </div>
    </div>
  );
}

export default Banner;