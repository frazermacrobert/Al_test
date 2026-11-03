import { useGameStore } from '../engine/store';
import { TitleScreen } from './screens/TitleScreen';
import { InvitationScreen } from './screens/InvitationScreen';
import { ConstructionScreen } from './screens/ConstructionScreen';
import { ExplorationScreen } from './screens/ExplorationScreen';
import { RoomScreen } from './screens/RoomScreen';
import { DawnScreen } from './screens/DawnScreen';
import { CasebookScreen } from './screens/CasebookScreen';

export function App() {
  const phase = useGameStore(s => s.phase);

  switch (phase) {
    case 'title': return <TitleScreen />;
    case 'invitation': return <InvitationScreen />;
    case 'construction': return <ConstructionScreen />;
    case 'exploration': return <ExplorationScreen />;
    case 'room': return <RoomScreen />;
    case 'dawn': return <DawnScreen />;
    case 'casebook': return <CasebookScreen />;
    default: return <TitleScreen />;
  }
}
