import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSkills } from '@/hooks/useProfile';
import { type Skill } from '@/integrations/supabase/profile';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface SkillsFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

interface SkillFormData {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
  years_of_experience: number | '';
}

export function SkillsForm({ isOpen, onClose, userId, onSuccess }: SkillsFormProps) {
  const { createSkills } = useSkills(userId);

  const [skills, setSkills] = useState<SkillFormData[]>([
    { name: '', level: '', years_of_experience: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validSkills = skills
        .filter(skill => skill.name.trim() !== '')
        .map(skill => ({
          user_id: userId,
          name: skill.name.trim(),
          level: skill.level || undefined,
          years_of_experience: skill.years_of_experience || undefined
        }));

      if (validSkills.length > 0) {
        await createSkills(validSkills);

        // Call onSuccess to refresh data
        if (onSuccess) {
          onSuccess();
        }

        onClose();
      }
    } catch (error) {
      console.error('Error saving skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (index: number, field: keyof SkillFormData, value: any) => {
    setSkills(prev => prev.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    ));
  };

  const addSkill = () => {
    setSkills(prev => [...prev, { name: '', level: '', years_of_experience: '' }]);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      case 'expert': return 'Expert';
      default: return 'Select level';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Skills</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Skill {index + 1}</h4>
                  {skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`skill-name-${index}`}>Skill Name *</Label>
                    <Input
                      id={`skill-name-${index}`}
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                      placeholder="e.g. React, Python, Project Management"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`skill-level-${index}`}>Proficiency Level</Label>
                    <Select
                      value={skill.level}
                      onValueChange={(value) => handleSkillChange(index, 'level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`skill-years-${index}`}>Years of Experience</Label>
                    <Input
                      id={`skill-years-${index}`}
                      type="number"
                      min="0"
                      max="50"
                      value={skill.years_of_experience}
                      onChange={(e) => handleSkillChange(index, 'years_of_experience', 
                        e.target.value ? parseInt(e.target.value) : ''
                      )}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addSkill}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Skill
          </Button>

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
              {loading ? 'Saving...' : 'Add Skills'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
