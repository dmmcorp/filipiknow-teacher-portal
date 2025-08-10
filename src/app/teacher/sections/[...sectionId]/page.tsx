import SectionDetails from './section-details';

interface SectionPageProps {
  params: {
    sectionId: string;
  };
}

const SectionPage = ({ params }: SectionPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionDetails sectionId={params.sectionId} />
    </div>
  );
};

export default SectionPage;
