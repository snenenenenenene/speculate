import { Metadata } from 'next';
import { QuestionnaireView } from '@/components/questionnaire/QuestionnaireView';

export const metadata: Metadata = {
  title: 'Questionnaire | Speculate',
  description: 'Take part in this interactive questionnaire',
};

interface QuestionnairePageProps {
  params: {
    projectId: string;
  };
}

export default async function QuestionnairePage({
  params,
}: QuestionnairePageProps) {
  return (
    <main className="min-h-screen bg-background">
      <QuestionnaireView projectId={params.projectId} />
    </main>
  );
} 