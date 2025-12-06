import React from 'react';
import { 
  Calculator, 
  BookOpen, 
  Sigma, 
  Flag, 
  Globe, 
  Map, 
  Atom, 
  FlaskConical, 
  Dna, 
  Languages, 
  HelpCircle 
} from 'lucide-react';

export const SubjectIcon: React.FC<{ iconName: string, className?: string }> = ({ iconName, className = "w-6 h-6" }) => {
  switch (iconName) {
    case 'Calculator': return <Calculator className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Sigma': return <Sigma className={className} />;
    case 'Flag': return <Flag className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Map': return <Map className={className} />;
    case 'Atom': return <Atom className={className} />;
    case 'FlaskConical': return <FlaskConical className={className} />;
    case 'Dna': return <Dna className={className} />;
    case 'Languages': return <Languages className={className} />;
    default: return <HelpCircle className={className} />;
  }
};
