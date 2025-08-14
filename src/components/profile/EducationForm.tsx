import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEducation } from '@/hooks/useProfile';
import { type Education } from '@/integrations/supabase/profile';
import { Save, X } from 'lucide-react';

interface EducationFormProps {
  isOpen: boolean;
  onClose: () => void;
  education?: Education;
  userId: string;
}

export function EducationForm({ isOpen, onClose, education, userId }: EducationFormProps) {
  const { createEducation, updateEducation } = useEducation(userId);
  const isEditing = !!education;

  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    degree: education?.degree || '',
    field_of_study: education?.field_of_study || '',
    start_date: education?.start_date || '',
    end_date: education?.end_date || '',
    is_current: education?.is_current || false,
    grade: education?.grade || '',
    description: education?.description || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        user_id: userId,
        end_date: formData.is_current ? null : formData.end_date
      };

      if (isEditing && education) {
        await updateEducation(education.id, data);
      } else {
        await createEducation(data);
      }

      onClose();
    } catch (error) {
      console.error('Error saving education:', error);
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
            {isEditing ? 'Edit Education' : 'Add Education'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="institution">Institution *</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              placeholder="e.g. Stanford University"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => handleChange('degree', e.target.value)}
                placeholder="e.g. Bachelor of Science"
                required
              />
            </div>

            <div>
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Input
                id="field_of_study"
                value={formData.field_of_study}
                onChange={(e) => handleChange('field_of_study', e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>
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
            <Label htmlFor="is_current">I currently study here</Label>
          </div>

          <div>
            <Label htmlFor="grade">Grade/GPA</Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              placeholder="e.g. 3.8/4.0, First Class Honours"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your studies, projects, achievements..."
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
