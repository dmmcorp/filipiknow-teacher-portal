import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AuthFlow } from '@/lib/types';
import { useAuthActions } from '@convex-dev/auth/react';
import { TriangleAlertIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

const REMEMBER_EMAIL_KEY = 'filipiknow-remember-email';

export const LoginCard = ({
  setState,
}: {
  setState: (state: AuthFlow) => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState('');
  const { signIn } = useAuthActions();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);

    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pending) return;

    setPending(true);
    setError('');

    try {
      await signIn('password', {
        email,
        password,
        flow: 'signIn',
      });
      setError('');

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch (error) {
      console.error('Sign in error:', error);

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError(
            'Connection error. Please check your internet connection and try again.'
          );
        } else {
          setError('Invalid email or password');
        }
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="w-md flex justify-center">
      <form onSubmit={onSignIn}>
        <Card className="w-[383px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Login your account
            </CardTitle>
          </CardHeader>
          <CardContent className="px-9 space-y-7">
            {!!error && (
              <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                <TriangleAlertIcon className="size-4" />
                {error}
              </div>
            )}

            <div className="relative">
              <Image
                src="/images/user-icon.svg"
                alt="user icon image"
                width={24}
                height={24}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="email"
                placeholder="Email address"
                className="pl-11 h-[40px]"
                disabled={pending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Image
                src="/images/lock-icon.svg"
                alt="user icon image"
                width={24}
                height={24}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="password"
                placeholder="Password"
                className="pl-11 h-[40px]"
                disabled={pending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  disabled={pending}
                  id="remember-me"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              className="w-full border-amber-900"
              type="submit"
              disabled={pending}
              variant="primary"
            >
              Log In
            </Button>

            {/* <CustomButton /> */}

            <Separator />

            <div className="flex items-center">
              Don&apos;t have an account yet?{' '}
              <Button
                onClick={() => setState('signUp')}
                className="text-blue-600"
                variant="ghost"
              >
                Register Here
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </section>
  );
};
