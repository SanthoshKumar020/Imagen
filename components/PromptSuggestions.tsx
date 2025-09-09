
import React from 'react';
import { PROMPT_TEMPLATES } from '../promptTemplates';
import { CharacterProfile } from '../types';

interface PromptSuggestionsProps {
  profile: CharacterProfile;
  onSelectPrompt: (prompt: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ profile, onSelectPrompt }) => {
  const fillTemplate = (template: string) => {
    return template
      .replace(/{name}/g, profile.name || 'character')
      .replace(/{persona}/g, profile.persona || 'a fictional influencer')
      .replace(/{description}/g, profile.description || 'a person');
  };

  const categories = [...new Set(PROMPT_TEMPLATES.map(p => p.category))];

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
      {categories.map(category => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-gray-400 mb-2 sticky top-0 bg-gray-900/50 py-1">{category}</h4>
          <div className="grid grid-cols-1 gap-2">
            {PROMPT_TEMPLATES.filter(p => p.category === category).map((prompt, index) => (
              <button
                key={index}
                onClick={() => onSelectPrompt(fillTemplate(prompt.template))}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-left text-xs text-gray-300 transition-colors w-full"
                aria-label={`Select prompt: ${prompt.title}`}
              >
                <p className="font-bold">{prompt.title}</p>
                <p className="opacity-80 line-clamp-2">{fillTemplate(prompt.template)}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromptSuggestions;
