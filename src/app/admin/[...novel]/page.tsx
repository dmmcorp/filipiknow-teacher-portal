import ChapterContent from './_component/chapter-content';

const formatText = (text: string | undefined | null) => {
  if (!text || text === null) return '';
  return text.replaceAll('%20', ' ');
};

export default async function Page({
  params,
}: {
  params: Promise<{ novel: string[] }>;
}) {
  const { novel } = await params;
  const data = {
    novel: formatText(novel[0]),
    chapterNo: formatText(novel[1]),
    chapterTitle: formatText(novel[2]),
  };
  return (
    <>
      <ChapterContent
        novel={data.novel}
        chapterNo={Number(data.chapterNo)}
        chapterTitle={data.chapterTitle}
      />
    </>
  );
}
