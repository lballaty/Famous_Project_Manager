import React, { useState, useEffect } from 'react';
import { Milestone } from '../types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Checkbox } from './ui/checkbox';

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: Milestone;
  onSave: (milestone: Partial<Milestone>) => void;
}

export function MilestoneDialog({ open, onOpenChange, milestone, onSave }: MilestoneDialogProps) {
  const [formData, setFormData] = useState<Partial<Milestone>>({});
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    if (milestone) {
      setFormData(milestone);
      setDate(new Date(milestone.date));
    } else {
      setFormData({
        title: '',
        completed: false
      });
      setDate(undefined);
    }
  }, [milestone, open]);

  const handleSave = () => {
    const milestoneData = {
      ...formData,
      date: date?.toISOString()
    };
    
    if (!milestone) {
      milestoneData.id = crypto.randomUUID();
    }
    
    onSave(milestoneData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{milestone ? 'Edit Milestone' : 'Create Milestone'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Milestone title"
            />
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={formData.completed || false}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, completed: checked as boolean })
              }
            />
            <Label htmlFor="completed">Completed</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.title || !date}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}