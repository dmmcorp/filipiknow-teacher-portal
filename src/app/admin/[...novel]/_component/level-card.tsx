import { Button } from '@/components/ui/button';
import { LevelsType } from '@/lib/types';
interface LevelCardProps {
  levelData: LevelsType;
}
function LevelCard({ levelData }: LevelCardProps) {
  return (
    <Button className="bg-background lg:h-50 flex items-center justify-center font-bold text-white text-3xl">
      {levelData.level}
    </Button>
  );
}

export default LevelCard;
