import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAchievements } from '@/hooks/useProfile';
import { type Achievement } from '@/integrations/supabase/profile';
import { Save, X } from 'lucide-react';

interface AchievementFormProps {
  isOpen: boolean;
  onClose: () => void;
  achievement?: Achievement;
  userId: string;
  onSuccess?: () => void;
}

export function AchievementForm({ isOpen, onClose, achievement, userId, onSuccess }: AchievementFormProps) {
  const { createAchievement, updateAchievement } = useAchievements(userId);
  const isEditing = !!achievement;

  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    description: achievement?.description || '',
    date_achieved: achievement?.date_achieved || '',
    organization: achievement?.organization || '',
    url: achievement?.url || ''
  });

  const [loading, setLoading] = useState(false);

  // Update form data when achievement prop changes
  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title || '',
        description: achievement.description || '',
        date_achieved: achievement.date_achieved || '',
        organization: achievement.organization || '',
        url: achievement.url || ''
      });
    } else {
      // Reset form for new achievement
      setFormData({
        title: '',
        description: '',
        date_achieved: '',
        organization: '',
        url: ''
      });
    }
  }, [achievement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        user_id: userId,
        date_achieved: formData.date_achieved || null
      };

      if (isEditing && achievement) {
        await updateAchievement(achievement.id, data);
      } else {
        await createAchievement(data);
      }

      // Call onSuccess to refresh data
      if (onSuccess) {
        onSuccess();
      }

      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        date_achieved: '',
        organization: '',
        url: ''
      });
    } catch (error) {
      console.error('Error saving achievement:', error);
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
            {isEditing ? 'Edit Achievement' : 'Add Achievement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Achievement Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Employee of the Year, Best Project Award"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                placeholder="e.g. Google, IEEE, Local Community"
              />
            </div>

            <div>
              <Label htmlFor="date_achieved">Date Achieved</Label>
              <Input
                id="date_achieved"
                type="date"
                value={formData.date_achieved}
                onChange={(e) => handleChange('date_achieved', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="url">Certificate/Proof URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com/certificate"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your achievement, what you accomplished, and its impact..."
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
