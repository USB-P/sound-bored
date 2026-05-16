function SoundButton({ label, soundSrc }) {
  function handleClick() {
    if (!soundSrc) return;
    const audio = new Audio(soundSrc);
    audio.play();
  }

  return (
    <button onClick={handleClick}>
      {label}
    </button>
  );
}

export default SoundButton;
