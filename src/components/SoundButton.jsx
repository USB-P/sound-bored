import { useRef } from 'react';

function SoundButton({ label, soundSrc, index }) {
  const progressRef = useRef(null);
  const audioRef = useRef(null);

  function handleClick() {
    if (!soundSrc) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(soundSrc);
    audioRef.current = audio;

    const progress = progressRef.current;
    progress.style.transition = 'none';
    progress.style.height = '100%';

    audio.addEventListener('loadedmetadata', () => {
      audio.play();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progress.style.transition = `height ${audio.duration}s linear`;
          progress.style.height = '0%';
        });
      });
    });

    audio.addEventListener('ended', () => {
      progress.style.transition = 'none';
      progress.style.height = '0%';
      audioRef.current = null;
    });
  }

  const paddedIndex = String(index).padStart(2, '0');

  return (
    <button className="sound-button" onClick={handleClick}>
      <div ref={progressRef} className="sound-button-progress" />
      <span className="sound-button-index">{paddedIndex}</span>
      <span className="sound-button-label">{label}</span>
    </button>
  );
}

export default SoundButton;
