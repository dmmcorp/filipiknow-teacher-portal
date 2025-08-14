import SectionDetails from './section-details';

const SectionPage = async ({
  params,
}: {
  params: Promise<{ sectionId: string[] }>;
}) => {
  const { sectionId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <SectionDetails sectionId={sectionId} />
    </div>
  );
};

export default SectionPage;
