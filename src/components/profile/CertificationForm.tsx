import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCertifications } from '@/hooks/useProfile';
import { type Certification } from '@/integrations/supabase/profile';
import { Save, X } from 'lucide-react';

interface CertificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  certification?: Certification;
  userId: string;
  onSuccess?: () => void;
}

export function CertificationForm({ isOpen, onClose, certification, userId, onSuccess }: CertificationFormProps) {
  const { createCertification, updateCertification } = useCertifications(userId);
  const isEditing = !!certification;

  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuing_organization: certification?.issuing_organization || '',
    issue_date: certification?.issue_date || '',
    expiration_date: certification?.expiration_date || '',
    credential_id: certification?.credential_id || '',
    credential_url: certification?.credential_url || '',
    description: certification?.description || ''
  });

  const [loading, setLoading] = useState(false);

  // Update form data when certification prop changes
  useEffect(() => {
    if (certification) {
      setFormData({
        name: certification.name || '',
        issuing_organization: certification.issuing_organization || '',
        issue_date: certification.issue_date || '',
        expiration_date: certification.expiration_date || '',
        credential_id: certification.credential_id || '',
        credential_url: certification.credential_url || '',
        description: certification.description || ''
      });
    } else {
      // Reset form for new certification
      setFormData({
        name: '',
        issuing_organization: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: '',
        description: ''
      });
    }
  }, [certification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        user_id: userId,
        expiration_date: formData.expiration_date || null
      };

      if (isEditing && certification) {
        await updateCertification(certification.id, data);
      } else {
        await createCertification(data);
      }

      // Call onSuccess to refresh data
      if (onSuccess) {
        onSuccess();
      }

      onClose();
      // Reset form
      setFormData({
        name: '',
        issuing_organization: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving certification:', error);
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
            {isEditing ? 'Edit Certification' : 'Add Certification'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Certification Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect, PMP"
              required
            />
          </div>

          <div>
            <Label htmlFor="issuing_organization">Issuing Organization *</Label>
            <Input
              id="issuing_organization"
              value={formData.issuing_organization}
              onChange={(e) => handleChange('issuing_organization', e.target.value)}
              placeholder="e.g. Amazon Web Services, Project Management Institute"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleChange('issue_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => handleChange('expiration_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credential_id">Credential ID</Label>
              <Input
                id="credential_id"
                value={formData.credential_id}
                onChange={(e) => handleChange('credential_id', e.target.value)}
                placeholder="e.g. AWS-ASA-12345"
              />
            </div>

            <div>
              <Label htmlFor="credential_url">Credential URL</Label>
              <Input
                id="credential_url"
                type="url"
                value={formData.credential_url}
                onChange={(e) => handleChange('credential_url', e.target.value)}
                placeholder="https://verify.example.com/credential"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this certification covers and its relevance..."
              rows={3}
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
