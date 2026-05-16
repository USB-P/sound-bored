import SoundButton from './components/SoundButton';
import newLeader from './sounds/newLeader.mp3';

function App() {
  return (
    <div>
      <h1>Sound Bored</h1>
      <SoundButton label="New Leader" soundSrc={newLeader} />
    </div>
  );
}

export default App;
