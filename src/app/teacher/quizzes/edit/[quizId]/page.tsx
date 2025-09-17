import { Id } from '../../../../../../convex/_generated/dataModel';
import QuizEditor from '../../_components/quiz-editor';

const EditQuizPage = async ({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) => {
  const { quizId } = await params;

  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      <QuizEditor quizId={quizId as Id<'games'>} />
    </div>
  );
};

export default EditQuizPage;
