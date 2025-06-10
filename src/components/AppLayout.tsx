import React from 'react';
import { ProjectTracker } from './ProjectTracker';
import { FloatingChat } from './FloatingChat';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Settings, Wifi } from 'lucide-react';
import { indexedDB } from '../lib/indexedDB';

const AppLayout: React.FC = () => {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [syncPopoverOpen, setSyncPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    // Initialize IndexedDB on app start
    indexedDB.init().catch(console.error);
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Popover open={syncPopoverOpen} onOpenChange={setSyncPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-lg">
              <Wifi className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0 w-80">
            <SyncStatusIndicator />
          </PopoverContent>
        </Popover>
      </div>

      <ProjectTracker />
      
      <FloatingChat 
        isOpen={chatOpen} 
        onToggle={() => setChatOpen(!chatOpen)} 
      />
    </div>
  );
};

export default AppLayout;