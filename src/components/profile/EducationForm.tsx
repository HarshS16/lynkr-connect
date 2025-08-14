import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEducation } from '@/hooks/useProfile';
import { type Education } from '@/integrations/supabase/profile';
import { Save, X, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { indianUniversities } from '@/data/indianUniversities';
import { degrees } from '@/data/degrees';
import { fieldsOfStudy } from '@/data/fieldsOfStudy';

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
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [isOtherInstitution, setIsOtherInstitution] = useState(false);
  const [degreeOpen, setDegreeOpen] = useState(false);
  const [degreeSearch, setDegreeSearch] = useState('');
  const [isOtherDegree, setIsOtherDegree] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');
  const [isOtherField, setIsOtherField] = useState(false);

  // Filter universities based on search
  const filteredUniversities = useMemo(() => {
    if (!institutionSearch) {
      // Show popular/important universities first, then others
      const popularUniversities = indianUniversities.filter(uni =>
        uni.includes('IIT') || uni.includes('IIM') || uni.includes('NIT') ||
        uni.includes('AIIMS') || uni.includes('University of Delhi') ||
        uni.includes('University of Mumbai') || uni.includes('Anna University') ||
        uni.includes('Jadavpur University') || uni.includes('Banaras Hindu University')
      );
      const otherUniversities = indianUniversities.filter(uni =>
        !popularUniversities.includes(uni)
      ).slice(0, 50); // Show first 50 of others
      return [...popularUniversities, ...otherUniversities];
    }

    // When searching, show all matching results (no limit for search)
    return indianUniversities.filter(university =>
      university.toLowerCase().includes(institutionSearch.toLowerCase())
    );
  }, [institutionSearch]);

  // Filter degrees based on search
  const filteredDegrees = useMemo(() => {
    if (!degreeSearch) return degrees; // Show all degrees by default
    return degrees.filter(degree =>
      degree.toLowerCase().includes(degreeSearch.toLowerCase())
    );
  }, [degreeSearch]);

  // Filter fields of study based on search
  const filteredFields = useMemo(() => {
    if (!fieldSearch) return fieldsOfStudy; // Show all fields by default
    return fieldsOfStudy.filter(field =>
      field.toLowerCase().includes(fieldSearch.toLowerCase())
    );
  }, [fieldSearch]);

  // Check if current institution is in the list or is custom
  useMemo(() => {
    if (formData.institution && !indianUniversities.includes(formData.institution)) {
      setIsOtherInstitution(true);
    }
  }, [formData.institution]);

  // Check if current degree is in the list or is custom
  useMemo(() => {
    if (formData.degree && !degrees.includes(formData.degree)) {
      setIsOtherDegree(true);
    }
  }, [formData.degree]);

  // Check if current field of study is in the list or is custom
  useMemo(() => {
    if (formData.field_of_study && !fieldsOfStudy.includes(formData.field_of_study)) {
      setIsOtherField(true);
    }
  }, [formData.field_of_study]);

  // Add wheel event listeners to scroll containers
  useEffect(() => {
    const handleWheelEvent = (e: WheelEvent) => {
      const target = e.target as HTMLElement;

      // Check if we're inside a dropdown scroll container
      const scrollContainer = target.closest('.dropdown-scroll-container');

      if (scrollContainer) {
        e.preventDefault();
        e.stopPropagation();

        // Apply smooth scrolling
        const scrollAmount = e.deltaY * 0.8;
        scrollContainer.scrollTop += scrollAmount;
      }
    };

    // Add event listener to document to catch all wheel events
    document.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

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
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving education:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
      grade: '',
      description: ''
    });
    setIsOtherInstitution(false);
    setInstitutionSearch('');
    setIsOtherDegree(false);
    setDegreeSearch('');
    setIsOtherField(false);
    setFieldSearch('');
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
            {!isOtherInstitution ? (
              <div className="space-y-2">
                <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={institutionOpen}
                      className="w-full justify-between"
                    >
                      {formData.institution || "Select institution..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search institutions..."
                        value={institutionSearch}
                        onValueChange={setInstitutionSearch}
                      />
                      <CommandEmpty>No institution found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto dropdown-scroll-container">
                        {filteredUniversities.map((university) => (
                          <CommandItem
                            key={university}
                            value={university}
                            onSelect={(currentValue) => {
                              handleChange('institution', currentValue);
                              setInstitutionOpen(false);
                              setInstitutionSearch('');
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.institution === university ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {university}
                          </CommandItem>
                        ))}
                        <CommandItem
                          value="other"
                          onSelect={() => {
                            setIsOtherInstitution(true);
                            handleChange('institution', '');
                            setInstitutionOpen(false);
                            setInstitutionSearch('');
                          }}
                          className="border-t border-gray-200 font-medium text-blue-600"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Other (Enter custom institution)
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOtherInstitution(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Can't find your institution? Enter manually
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  placeholder="Enter institution name"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOtherInstitution(false);
                    handleChange('institution', '');
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Choose from list instead
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="degree">Degree *</Label>
              {!isOtherDegree ? (
                <div className="space-y-2">
                  <Popover open={degreeOpen} onOpenChange={setDegreeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={degreeOpen}
                        className="w-full justify-between"
                      >
                        {formData.degree || "Select degree..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search degrees..."
                          value={degreeSearch}
                          onValueChange={setDegreeSearch}
                        />
                        <CommandEmpty>No degree found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto dropdown-scroll-container">
                          {filteredDegrees.map((degree) => (
                            <CommandItem
                              key={degree}
                              value={degree}
                              onSelect={(currentValue) => {
                                handleChange('degree', currentValue);
                                setDegreeOpen(false);
                                setDegreeSearch('');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.degree === degree ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {degree}
                            </CommandItem>
                          ))}
                          <CommandItem
                            value="other"
                            onSelect={() => {
                              setIsOtherDegree(true);
                              handleChange('degree', '');
                              setDegreeOpen(false);
                              setDegreeSearch('');
                            }}
                            className="border-t border-gray-200 font-medium text-blue-600"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Other (Enter custom degree)
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOtherDegree(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Can't find your degree? Enter manually
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    placeholder="Enter degree name"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsOtherDegree(false);
                      handleChange('degree', '');
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Choose from list instead
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="field_of_study">Field of Study</Label>
              {!isOtherField ? (
                <div className="space-y-2">
                  <Popover open={fieldOpen} onOpenChange={setFieldOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={fieldOpen}
                        className="w-full justify-between"
                      >
                        {formData.field_of_study || "Select field of study..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search fields..."
                          value={fieldSearch}
                          onValueChange={setFieldSearch}
                        />
                        <CommandEmpty>No field found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto dropdown-scroll-container">
                          {filteredFields.map((field) => (
                            <CommandItem
                              key={field}
                              value={field}
                              onSelect={(currentValue) => {
                                handleChange('field_of_study', currentValue);
                                setFieldOpen(false);
                                setFieldSearch('');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.field_of_study === field ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {field}
                            </CommandItem>
                          ))}
                          <CommandItem
                            value="other"
                            onSelect={() => {
                              setIsOtherField(true);
                              handleChange('field_of_study', '');
                              setFieldOpen(false);
                              setFieldSearch('');
                            }}
                            className="border-t border-gray-200 font-medium text-blue-600"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Other (Enter custom field)
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOtherField(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Can't find your field? Enter manually
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="field_of_study"
                    value={formData.field_of_study}
                    onChange={(e) => handleChange('field_of_study', e.target.value)}
                    placeholder="Enter field of study"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsOtherField(false);
                      handleChange('field_of_study', '');
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Choose from list instead
                  </Button>
                </div>
              )}
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

          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) => handleChange('is_current', checked)}
            />
            <Label htmlFor="is_current">I currently study here</Label>
          </div> */}
          <div className="flex items-center space-x-2">
  <Checkbox
    id="is_current"
    checked={formData.is_current}
    onCheckedChange={(checked) => handleChange('is_current', checked)}
    className="border-2 border-gray-400 dark:border-gray-200"
  />
  <Label
    htmlFor="is_current"
    className="text-gray-800 dark:text-gray-200"
  >
    I currently study here
  </Label>
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
              onClick={() => {
                resetForm();
                onClose();
              }}
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
