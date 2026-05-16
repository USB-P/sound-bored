import { useRef } from 'react';

let activeAudio = null;
let activeProgress = null;

export function stopActiveAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if (activeProgress) {
    activeProgress.style.transition = 'none';
    activeProgress.style.height = '0%';
    activeProgress = null;
  }
}

function SoundButton({ label, soundSrc, index }) {
  const progressRef = useRef(null);

  function handleClick() {
    if (!soundSrc) return;

    stopActiveAudio();

    const audio = new Audio(soundSrc);
    activeAudio = audio;
    activeProgress = progressRef.current;

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
      activeAudio = null;
      activeProgress = null;
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
