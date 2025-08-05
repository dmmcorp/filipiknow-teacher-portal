import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthActions } from '@convex-dev/auth/react';
import { TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const LoginCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState('');
  const { signIn } = useAuthActions();

  // const router = useRouter()

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
    <section className="flex flex-col min-h-screen px-4  py-16 md:py-32">
      <form
        onSubmit={onSignIn}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pt-0 pb-6">
          <div>
            <Link href="/" aria-label="go home" className="md:hidden ">
              <Logo />
            </Link>
            <Separator />
            <h1 className="mb-1 mt-4 text-3xl  text-center font-semibold">
              Login
            </h1>
            <p className="text-sm text-center">
              Welcome back! Login to continue
            </p>
          </div>
          {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
              <TriangleAlertIcon className="size-4" />
              {error}
            </div>
          )}

          <hr className="my-4 border-dashed" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Username
              </Label>
              <Input
                type="email"
                placeholder="Email"
                disabled={pending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-title text-sm">
                  Password
                </Label>
              </div>
              <Input
                type="password"
                className="input sz-md variant-mixed"
                placeholder="Password"
                disabled={pending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              className="w-full bg-background"
              type="submit"
              size="lg"
              disabled={pending}
            >
              Log In
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};
