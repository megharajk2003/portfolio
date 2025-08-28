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

const moduleFormSchema = z.object({
  courseId: z.string().min(1, 'Course selection is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  moduleOrder: z.number().int().positive('Order must be a positive number'),
  durationHours: z.number().int().positive('Duration must be a positive number').optional(),
});

type ModuleFormData = z.infer<typeof moduleFormSchema>;

interface Course {
  id: string;
  title: string;
}

interface AdminModuleFormProps {
  module?: any;
  onSubmit: (data: ModuleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdminModuleForm({ module, onSubmit, onCancel, isLoading }: AdminModuleFormProps) {
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
  });

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      courseId: module?.courseId || '',
      title: module?.title || '',
      description: module?.description || '',
      moduleOrder: module?.moduleOrder || 1,
      durationHours: module?.durationHours || undefined,
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle data-testid="text-module-form-title">
          {module ? 'Edit Module' : 'Create New Module'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-module-course">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
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
                    <Input placeholder="Module title" {...field} data-testid="input-module-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Module description" 
                      rows={4} 
                      {...field} 
                      data-testid="textarea-module-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="moduleOrder"
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
                        data-testid="input-module-order"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="12" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                        data-testid="input-module-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-module">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit-module">
                {isLoading ? 'Saving...' : module ? 'Update Module' : 'Create Module'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}