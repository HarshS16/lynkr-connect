import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWorkExperience } from '@/hooks/useProfile';
import { type WorkExperience } from '@/integrations/supabase/profile';
import { Save, X } from 'lucide-react';

interface WorkExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  workExperience?: WorkExperience;
  userId: string;
}

export function WorkExperienceForm({ isOpen, onClose, workExperience, userId }: WorkExperienceFormProps) {
  const { createWorkExperience, updateWorkExperience } = useWorkExperience(userId);
  const isEditing = !!workExperience;

  const [formData, setFormData] = useState({
    title: workExperience?.title || '',
    company: workExperience?.company || '',
    location: workExperience?.location || '',
    start_date: workExperience?.start_date || '',
    end_date: workExperience?.end_date || '',
    is_current: workExperience?.is_current || false,
    description: workExperience?.description || ''
  });

  const [loading, setLoading] = useState(false);

  // Update form data when workExperience prop changes
  useEffect(() => {
    if (workExperience) {
      setFormData({
        title: workExperience.title || '',
        company: workExperience.company || '',
        location: workExperience.location || '',
        start_date: workExperience.start_date || '',
        end_date: workExperience.end_date || '',
        is_current: workExperience.is_current || false,
        description: workExperience.description || ''
      });
    } else {
      // Reset form for new work experience
      setFormData({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: ''
      });
    }
  }, [workExperience]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        user_id: userId,
        end_date: formData.is_current ? null : formData.end_date
      };

      if (isEditing && workExperience) {
        await updateWorkExperience(workExperience.id, data);
      } else {
        await createWorkExperience(data);
      }

      onClose();
    } catch (error) {
      console.error('Error saving work experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="e.g. Google"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                disabled={formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) => handleChange('is_current', checked)}
            />
            <Label htmlFor="is_current">I currently work here</Label>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your role, responsibilities, and achievements..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
