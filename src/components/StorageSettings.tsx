import React, { useState } from 'react';
import { StorageConfig } from '../types/project';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Database, HardDrive, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface StorageSettingsProps {
  config: StorageConfig;
  onConfigChange: (config: StorageConfig) => void;
}

export function StorageSettings({ config, onConfigChange }: StorageSettingsProps) {
  const [tempConfig, setTempConfig] = useState<StorageConfig>(config);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onConfigChange(tempConfig);
    localStorage.setItem('storageConfig', JSON.stringify(tempConfig));
    toast({
      title: "Settings Saved",
      description: "Storage configuration has been updated"
    });
  };

  const testSupabaseConnection = async () => {
    if (!tempConfig.supabaseUrl || !tempConfig.supabaseKey) {
      toast({
        title: "Missing Configuration",
        description: "Please provide both Supabase URL and API key",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Simple test - try to fetch from Supabase
      const response = await fetch(`${tempConfig.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': tempConfig.supabaseKey,
          'Authorization': `Bearer ${tempConfig.supabaseKey}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Supabase"
        });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Supabase. Check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Storage Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">Current Storage:</span>
          <Badge variant={config.type === 'local' ? 'secondary' : 'default'}>
            {config.type === 'local' ? 'Local Storage' : 'Supabase'}
          </Badge>
        </div>

        <RadioGroup 
          value={tempConfig.type} 
          onValueChange={(value: 'local' | 'supabase') => 
            setTempConfig({ ...tempConfig, type: value })
          }
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="local" id="local" />
            <div className="flex items-center gap-2 flex-1">
              <HardDrive className="h-4 w-4" />
              <div>
                <Label htmlFor="local" className="font-medium">Local Storage</Label>
                <p className="text-sm text-muted-foreground">
                  Store data in your browser's local storage
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="supabase" id="supabase" />
            <div className="flex items-center gap-2 flex-1">
              <Database className="h-4 w-4" />
              <div>
                <Label htmlFor="supabase" className="font-medium">Supabase</Label>
                <p className="text-sm text-muted-foreground">
                  Store data in Supabase cloud database
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>

        {tempConfig.type === 'supabase' && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="supabaseUrl">Supabase URL</Label>
              <Input
                id="supabaseUrl"
                placeholder="https://your-project.supabase.co"
                value={tempConfig.supabaseUrl || ''}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  supabaseUrl: e.target.value
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
              <Input
                id="supabaseKey"
                type="password"
                placeholder="Your Supabase anon key"
                value={tempConfig.supabaseKey || ''}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  supabaseKey: e.target.value
                })}
              />
            </div>
            
            <Button 
              onClick={testSupabaseConnection}
              disabled={isTestingConnection}
              variant="outline"
              className="w-full"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}