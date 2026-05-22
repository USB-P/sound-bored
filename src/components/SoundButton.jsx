import { useRef, forwardRef } from 'react';

let audioCtx = null;
let activeAudio = null;
let activeProgress = null;
let activeWetGain = null;
let analyserNode = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function getAnalyser(ctx) {
  if (!analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.85;
  }
  return analyserNode;
}

export function getMeterLevel() {
  if (!analyserNode) return 0;
  const data = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteTimeDomainData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / data.length);
}

let impulseBuffer = null;

function buildLargeRoomIR(ctx) {
  if (impulseBuffer) return impulseBuffer;
  const duration = 0.8;
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-6.0 * i / length);
    }
  }
  impulseBuffer = buffer;
  return buffer;
}

async function buildReverbChain(ctx) {
  const buffer = buildLargeRoomIR(ctx);
  const convolver = ctx.createConvolver();
  convolver.buffer = buffer;
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0;
  convolver.connect(wetGain);
  wetGain.connect(ctx.destination);
  return { reverbInput: convolver, wetGain };
}

export function isAudioActive() {
  return activeAudio !== null && !activeAudio.ended;
}

export function stopActiveAudio() {
  if (activeWetGain) {
    activeWetGain.gain.cancelScheduledValues(0);
    activeWetGain.gain.setValueAtTime(0, 0);
    activeWetGain = null;
  }
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

async function playAudioCore(src, reverbEnabled, progressEl) {
  stopActiveAudio();

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const audio = new Audio(src);
  audio.crossOrigin = 'anonymous';
  activeAudio = audio;
  activeProgress = progressEl;

  const source = ctx.createMediaElementSource(audio);
  source.connect(getAnalyser(ctx));
  const reverbChain = reverbEnabled ? await buildReverbChain(ctx) : null;
  if (reverbChain) {
    activeWetGain = reverbChain.wetGain;
    source.connect(reverbChain.reverbInput);
  }
  source.connect(ctx.destination);

  if (progressEl) {
    progressEl.style.transition = 'none';
    progressEl.style.height = '100%';
  }

  audio.addEventListener('loadedmetadata', () => {
    audio.play().then(() => {
      if (reverbChain) {
        const now = ctx.currentTime;
        const endAt = now + (audio.duration - audio.currentTime);
        const { wetGain } = reverbChain;
        wetGain.gain.setValueAtTime(0, now);
        wetGain.gain.setValueAtTime(0, endAt - 0.15);
        wetGain.gain.linearRampToValueAtTime(0.7, endAt);
      }
      if (progressEl) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            progressEl.style.transition = `height ${audio.duration}s linear`;
            progressEl.style.height = '0%';
          });
        });
      }
    });
  });

  audio.addEventListener('ended', () => {
    if (progressEl) {
      progressEl.style.transition = 'none';
      progressEl.style.height = '0%';
    }
    activeAudio = null;
    activeProgress = null;
  });
}

export async function playAudioDirect(src, reverbEnabled) {
  await playAudioCore(src, reverbEnabled, null);
}

const SoundButton = forwardRef(function SoundButton({ label, soundSrc, index, isFavorited, onToggleFavorite, color = 'red', keyLabel, reverbEnabled, playCount, onPlay, lastPlayers = [] }, ref) {
  const progressRef = useRef(null);

  async function handleClick() {
    if (!soundSrc) return;
    onPlay?.(label);
    await playAudioCore(soundSrc, reverbEnabled, progressRef.current);
  }

  function handleFavorite(e) {
    e.stopPropagation();
    onToggleFavorite(label);
  }

  const paddedIndex = String(index).padStart(2, '0');

  return (
    <button ref={ref} className={`sound-button sound-button--${color}`} onClick={handleClick}>
      <div ref={progressRef} className="sound-button-progress" />
      <span className="sound-button-index">{paddedIndex}</span>
      <span
        className={`sound-button-favorite${isFavorited ? ' is-favorite' : ''}`}
        onClick={handleFavorite}
        role="button"
        aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
      >
        {isFavorited ? '★' : '☆'}
      </span>
      {lastPlayers.length > 0 && (
        <div className="sound-button-last-players">
          {lastPlayers.map(p => (
            <img
              key={p.userId}
              className="sound-button-last-avatar"
              src={p.avatarUrl}
              alt={p.displayName ?? ''}
              title={p.displayName ?? ''}
            />
          ))}
        </div>
      )}
      <span className="sound-button-label">{label}</span>
      {playCount > 0 && <span className={`sound-button-plays${keyLabel ? ' sound-button-plays--with-key' : ''}`}>{playCount}</span>}
      {keyLabel && <span className="sound-button-key">{keyLabel}</span>}
    </button>
  );
})

export default SoundButton;
