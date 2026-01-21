import { ConfigField } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigFormProps {
    fields: ConfigField[];
    values: Record<string, string>;
    onChange: (name: string, value: string) => void;
}

export function ConfigForm({ fields, values, onChange }: ConfigFormProps) {
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
                        <Input
                            id={field.name}
                            type="text"
                            placeholder={field.placeholder}
                            value={values[field.name] || ''}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            required={field.required}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
