import { Id } from '../../../../../../convex/_generated/dataModel';
import QuizEditor from '../../_components/quiz-editor';

interface EditQuizPageProps {
  params: {
    quizId: string;
  };
}

const EditQuizPage = ({ params }: EditQuizPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      <QuizEditor quizId={params.quizId as Id<'games'>} />
    </div>
  );
};

export default EditQuizPage;
