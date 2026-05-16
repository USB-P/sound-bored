import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react'
import SoundButton from './components/SoundButton'
import fiftyLet from './sounds/50_let.mp3'
import ameba from './sounds/ameba.mp3'
import brcnoZogo from './sounds/brcno_zogo.mp3'
import chemicalFrogs from './sounds/chemical_frogs.mp3'
import computer from './sounds/computer.mp3'
import condizioniMeterologicci from './sounds/condizioni_meterologicci.mp3'
import dancingFonDeStreet from './sounds/dancing_fon_de_street.mp3'
import dejNo from './sounds/dej_no.mp3'
import fahhhhh from './sounds/fahhhhh.mp3'
import gayFrogs from './sounds/gay_frogs.mp3'
import gremoMaribor from './sounds/gremo_maribor.mp3'
import guyssss from './sounds/guyssss.mp3'
import huh from './sounds/huh.mp3'
import jePaKul from './sounds/je_pa_kul.mp3'
import kaniNeMore from './sounds/kani_ne_more.mp3'
import mariborZgubo from './sounds/maribor_zgubo.mp3'
import muori from './sounds/muori.mp3'
import neBitParmer from './sounds/ne_bit_parmer.mp3'
import temuSeRece from './sounds/temu_se_rece.mp3'
import venBosLetu from './sounds/ven_bos_letu.mp3'
import vseMoPocedle from './sounds/vse_mo_pocedle.mp3'
import vseSeRece from './sounds/vse_se_rece.mp3'
import waterrrrrr from './sounds/waterrrrrr.mp3'
import zmagoGreVen from './sounds/zmago_gre_ven.mp3'
import zmagoJeCefur from './sounds/zmago_je_cefur.mp3'
import zmagoJej from './sounds/zmago_jej.mp3'
import zmagoNaTecaj from './sounds/zmago_na_tecaj.mp3'
import zmagoNeJebe from './sounds/zmago_ne_jebe.mp3'
import zmagotovaDrzava from './sounds/zmagotova_drzava.mp3'
import zmagotovaHisterija from './sounds/zmagotova_histerija.mp3'
import zmagotovaKitica from './sounds/zmagotova_kitica.mp3'
import zmagotovaKvantiteta from './sounds/zmagotova_kvantiteta.mp3'
import zmedeniZmago from './sounds/zmedeni_zmago.mp3'

const sounds = [
  { label: '50_let.mp3', src: fiftyLet },
  { label: 'ameba.mp3', src: ameba },
  { label: 'brcno_zogo.mp3', src: brcnoZogo },
  { label: 'chemical_frogs.mp3', src: chemicalFrogs },
  { label: 'computer.mp3', src: computer },
  { label: 'condizioni_meterologicci.mp3', src: condizioniMeterologicci },
  { label: 'dancing_fon_de_street.mp3', src: dancingFonDeStreet },
  { label: 'dej_no.mp3', src: dejNo },
  { label: 'fahhhhh.mp3', src: fahhhhh },
  { label: 'gay_frogs.mp3', src: gayFrogs },
  { label: 'gremo_maribor.mp3', src: gremoMaribor },
  { label: 'guyssss.mp3', src: guyssss },
  { label: 'huh.mp3', src: huh },
  { label: 'je_pa_kul.mp3', src: jePaKul },
  { label: 'kani_ne_more.mp3', src: kaniNeMore },
  { label: 'maribor_zgubo.mp3', src: mariborZgubo },
  { label: 'muori.mp3', src: muori },
  { label: 'ne_bit_parmer.mp3', src: neBitParmer },
  { label: 'temu_se_rece.mp3', src: temuSeRece },
  { label: 'ven_bos_letu.mp3', src: venBosLetu },
  { label: 'vse_mo_pocedle.mp3', src: vseMoPocedle },
  { label: 'vse_se_rece.mp3', src: vseSeRece },
  { label: 'waterrrrrr.mp3', src: waterrrrrr },
  { label: 'zmago_gre_ven.mp3', src: zmagoGreVen },
  { label: 'zmago_je_cefur.mp3', src: zmagoJeCefur },
  { label: 'zmago_jej.mp3', src: zmagoJej },
  { label: 'zmago_na_tecaj.mp3', src: zmagoNaTecaj },
  { label: 'zmago_ne_jebe.mp3', src: zmagoNeJebe },
  { label: 'zmagotova_drzava.mp3', src: zmagotovaDrzava },
  { label: 'zmagotova_histerija.mp3', src: zmagotovaHisterija },
  { label: 'zmagotova_kitica.mp3', src: zmagotovaKitica },
  { label: 'zmagotova_kvantiteta.mp3', src: zmagotovaKvantiteta },
  { label: 'zmedeni_zmago.mp3', src: zmedeniZmago },
]

function App() {
  return (
    <>
      <SignedOut>
        <div className="auth-wrapper">
          <SignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="soundboard-card">
          <div className="soundboard-header">
            <span className="soundboard-title">Sound-Bored</span>
            <UserButton />
          </div>
          <div className="sound-grid">
            {sounds.map((sound, i) => (
              <SoundButton key={sound.label} index={i + 1} label={sound.label} soundSrc={sound.src} />
            ))}
          </div>
        </div>
      </SignedIn>
    </>
  )
}

export default App
