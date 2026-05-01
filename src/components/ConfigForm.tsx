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
    const getInvalidTokens = (val: string) => {
        if (!availableVariables) return [];
        const matches = val.match(/{{(.*?)}}/g);
        if (!matches) return [];
        const validNames = availableVariables.map(v => v.name);
        return matches.filter(m => {
            const inner = m.slice(2, -2).trim();
            if (inner.startsWith('trigger.payload.')) {
                return !validNames.includes(inner);
            }
            return false;
        });
    };

    return (
        <div className="space-y-4">
            {fields.map((field) => {
                const invalidTokens = getInvalidTokens(values[field.name] || '');
                return (
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
                                        <SelectValue placeholder="Trigger Tokens" />
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
                    {invalidTokens.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                            Invalid tokens: {invalidTokens.join(', ')}. Please use valid tokens from the dropdown.
                        </p>
                    )}
                </div>
            )})}
        </div>
    );
}
