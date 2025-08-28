import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  language: z.string().default('English'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All']),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  promoVideoUrl: z.string().url().optional().or(z.literal('')),
  isFree: z.boolean().default(false),
  price: z.string().optional(),
  durationMonths: z.number().int().positive().optional(),
  scheduleInfo: z.string().optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  skillsYouWillGain: z.array(z.string()).optional(),
  detailsToKnow: z.array(z.string()).optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface AdminCourseFormProps {
  course?: any;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdminCourseForm({ course, onSubmit, onCancel, isLoading }: AdminCourseFormProps) {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || '',
      subtitle: course?.subtitle || '',
      description: course?.description || '',
      language: course?.language || 'English',
      level: course?.level || 'Beginner',
      coverImageUrl: course?.coverImageUrl || '',
      promoVideoUrl: course?.promoVideoUrl || '',
      isFree: course?.isFree || false,
      price: course?.price || '',
      durationMonths: course?.durationMonths || undefined,
      scheduleInfo: course?.scheduleInfo || '',
      whatYouWillLearn: course?.whatYouWillLearn || [],
      skillsYouWillGain: course?.skillsYouWillGain || [],
      detailsToKnow: course?.detailsToKnow || [],
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
    // Convert arrays from strings if needed
    const processedData = {
      ...data,
      price: data.isFree ? null : data.price,
      whatYouWillLearn: Array.isArray(data.whatYouWillLearn) 
        ? data.whatYouWillLearn 
        : data.whatYouWillLearn ? [data.whatYouWillLearn] : [],
      skillsYouWillGain: Array.isArray(data.skillsYouWillGain) 
        ? data.skillsYouWillGain 
        : data.skillsYouWillGain ? [data.skillsYouWillGain] : [],
      detailsToKnow: Array.isArray(data.detailsToKnow) 
        ? data.detailsToKnow 
        : data.detailsToKnow ? [data.detailsToKnow] : [],
    };
    
    await onSubmit(processedData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle data-testid="text-course-form-title">
          {course ? 'Edit Course' : 'Create New Course'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Course title" {...field} data-testid="input-course-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Course subtitle" {...field} data-testid="input-course-subtitle" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Course description" 
                      rows={4} 
                      {...field} 
                      data-testid="textarea-course-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} data-testid="input-course-language" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-course-level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="All">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Months)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="12" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                        data-testid="input-course-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} data-testid="input-course-cover-image" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promoVideoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promo Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} data-testid="input-course-promo-video" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Course</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this course available for free
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-course-free"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch('isFree') && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="99.99" {...field} data-testid="input-course-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="scheduleInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Info</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="10-12 hours per week, flexible schedule" 
                      {...field} 
                      data-testid="textarea-course-schedule"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-course">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit-course">
                {isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}