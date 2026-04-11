export interface ConfigField {
    name: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'boolean';
    required?: boolean;
    options?: { label: string; value: string }[];
    placeholder?: string;
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigFormProps {
    fields: ConfigField[];
    values: Record<string, string>;
    onChange: (name: string, value: string) => void;
    availableVariables?: { name: string; label: string }[];
}

export function ConfigForm({ fields, values, onChange, availableVariables }: ConfigFormProps) {
    return (
        <div className="space-y-4">
            {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === 'select' ? (
                        <Select
                            value={values[field.name]}
                            onValueChange={(value) => onChange(field.name, value)}
                        >
                            <SelectTrigger id={field.name}>
                                <SelectValue placeholder={`Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                id={field.name}
                                type="text"
                                placeholder={field.placeholder}
                                value={values[field.name] || ''}
                                onChange={(e) => onChange(field.name, e.target.value)}
                                required={field.required}
                                className="flex-1"
                            />
                            {availableVariables && availableVariables.length > 0 && (
                                <Select onValueChange={(val) => {
                                    const currentVal = values[field.name] || '';
                                    onChange(field.name, currentVal + val);
                                }}>
                                    <SelectTrigger className="w-[140px] shrink-0 border border-input bg-white text-black hover:bg-zinc-50 shadow-sm">
                                        <SelectValue placeholder="Ingredients" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-black border-input">
                                        {availableVariables.map((v) => (
                                            <SelectItem key={v.name} value={`{{${v.name}}}`} className="cursor-pointer">
                                                {v.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
