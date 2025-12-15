import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from './Badge';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, suggestions = [] }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInputValue('');
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                {tags.map((tag, index) => (
                    <Badge key={index} variant="neutral" className="flex items-center gap-1 pr-1">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                            <X size={10} />
                        </button>
                    </Badge>
                ))}
                <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-sm min-w-[60px]"
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                />
            </div>
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-400 mr-1 self-center">Suggested:</span>
                    {suggestions.slice(0, 5).map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => !tags.includes(s) && onChange([...tags, s])}
                            className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors border border-gray-200"
                        >
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
