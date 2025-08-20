import { useState } from "react";
import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Plus, X } from "lucide-react";

interface ArrayFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  description?: string;
}

export function ArrayField({
  control,
  name,
  label,
  placeholder,
  icon,
  description,
}: ArrayFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const addItem = () => {
    append("");
  };

  return (
    <div className="md:col-span-2 space-y-3">
      <FormLabel className="flex items-center space-x-2">
        {icon}
        <span>{label}</span>
      </FormLabel>
      {description && <p className="text-xs text-gray-500">{description}</p>}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            <FormField
              control={control}
              name={`${name}.${index}`}
              render={({ field: inputField }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder={placeholder} {...inputField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add {label.slice(0, -1)}</span>
        </Button>
      </div>
    </div>
  );
}
