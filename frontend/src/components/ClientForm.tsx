import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ClientFormProps, ProjectType, projectTypeOptions } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Send } from 'lucide-react';

const clientFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  project_type: z.nativeEnum(ProjectType),
  project_scope: z.string().min(10, 'Project scope must be at least 10 characters').max(1000, 'Project scope must be less than 1000 characters'),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  additional_notes: z.string().max(500, 'Additional notes must be less than 500 characters').optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      project_type: ProjectType.WEB_DEVELOPMENT,
    },
  });

  const onFormSubmit = (data: ClientFormData) => {
    onSubmit(data);
    if (!isLoading) {
      reset();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Start Your Onboarding
          </CardTitle>
          <CardDescription className="text-center">
            Tell us about your project and we'll handle the rest automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="John Doe"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
              <div>
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type *
                </label>
                <select
                  id="project_type"
                  {...register('project_type')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {projectTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.project_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.project_type.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="project_scope" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Scope *
                </label>
                <Textarea
                  id="project_scope"
                  {...register('project_scope')}
                  placeholder="Describe your project goals, features, and requirements..."
                  rows={4}
                  className={errors.project_scope ? 'border-red-500' : ''}
                />
                {errors.project_scope && (
                  <p className="text-red-500 text-sm mt-1">{errors.project_scope.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <Input
                    id="budget_range"
                    {...register('budget_range')}
                    placeholder="$5,000 - $10,000"
                  />
                </div>
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline
                  </label>
                  <Input
                    id="timeline"
                    {...register('timeline')}
                    placeholder="2-3 months"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <Textarea
                  id="additional_notes"
                  {...register('additional_notes')}
                  placeholder="Any additional requirements or preferences..."
                  rows={3}
                  className={errors.additional_notes ? 'border-red-500' : ''}
                />
                {errors.additional_notes && (
                  <p className="text-red-500 text-sm mt-1">{errors.additional_notes.message}</p>
                )}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-4"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting Onboarding...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Start Onboarding Process
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};