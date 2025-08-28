import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

const lessonFormSchema = z.object({
  moduleId: z.string().min(1, 'Module selection is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  lessonOrder: z.number().int().positive('Order must be a positive number'),
  durationMinutes: z.number().int().positive('Duration must be a positive number').optional(),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface Module {
  id: string;
  title: string;
  courseId: string;
}

interface AdminLessonFormProps {
  lesson?: any;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdminLessonForm({ lesson, onSubmit, onCancel, isLoading }: AdminLessonFormProps) {
  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ['/api/admin/modules'],
  });

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      moduleId: lesson?.moduleId || '',
      title: lesson?.title || '',
      content: lesson?.content || '',
      videoUrl: lesson?.videoUrl || '',
      lessonOrder: lesson?.lessonOrder || 1,
      durationMinutes: lesson?.durationMinutes || undefined,
    },
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle data-testid="text-lesson-form-title">
          {lesson ? 'Edit Lesson' : 'Create New Lesson'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-lesson-module">
                        <SelectValue placeholder="Select a module" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Lesson title" {...field} data-testid="input-lesson-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Lesson content (markdown supported)" 
                      rows={8} 
                      {...field} 
                      data-testid="textarea-lesson-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} data-testid="input-lesson-video" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="lessonOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                        value={field.value || ''}
                        data-testid="input-lesson-order"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="45" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                        data-testid="input-lesson-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-lesson">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit-lesson">
                {isLoading ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}