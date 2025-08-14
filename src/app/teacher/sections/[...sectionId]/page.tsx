import SectionDetails from './section-details';

const SectionPage = ({ params }: { params: { sectionId: string[] } }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionDetails sectionId={params.sectionId} />
    </div>
  );
};

export default SectionPage;
