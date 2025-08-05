'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface BackBtnProps {
  onClick?: () => void;
  label?: string;
  variant?:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
  styles?: string | undefined;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
}

export default function BackBtn({
  onClick,
  label,
  variant = 'ghost',
  styles,
  size,
}: BackBtnProps) {
  const router = useRouter();
  return (
    <Button
      size={size}
      type="button"
      onClick={onClick ? onClick : () => router.back()}
      variant={variant}
      className={styles}
    >
      {label ? (
        label
      ) : (
        <>
          <ArrowLeft />
        </>
      )}
    </Button>
  );
}
