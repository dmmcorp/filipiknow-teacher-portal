import ChapterContent from './_component/chapter-content';

const formatText = (text: string | undefined | null) => {
  if (!text || text === null) return '';
  return text.replaceAll('%20', ' ');
};

async function Page({
  params,
}: {
  params: {
    novel: Promise<string[]>;
  };
}) {
  const novelArr = await (await params).novel;
  const data = {
    novel: formatText(novelArr[0]),
    chapterNo: formatText(novelArr[1]),
    chapterTitle: formatText(novelArr[2]),
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

export default Page;
