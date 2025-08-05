'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuthFlow } from '@/lib/types';
import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import { Loader2Icon, TriangleAlertIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../convex/_generated/api';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

export const RegisterCard = ({
  setState,
}: {
  setState: (state: AuthFlow) => void;
}) => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    newsletter: false,
  });
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certification, setCertification] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { signIn } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      const { storageId } = await result.json();
      //   form.setValue("image", storageId);
      setImage(storageId);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      // Cleanup preview URL on error
      URL.revokeObjectURL(newPreviewUrl);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExtensions = ['.pdf', '.docx'];
    const fileName = file.name.toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.some((ext) => fileName.endsWith(ext))
    ) {
      toast.error('Only PDF or DOCX files are allowed');
      return;
    }

    setIsUploading(true);
    setSelectedFile(file);

    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      const { storageId } = await result.json();
      setCertification(storageId);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckboxChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      setError('You must agree to the Terms and Privacy Policy');
      setIsSubmitting(false);
      return;
    }

    if (!certification) {
      setError('Please upload your certification file');
      setIsSubmitting(false);
      return;
    }

    try {
      await signIn('password', {
        email,
        password,
        fname,
        lname,
        image,
        role: 'teacher',
        licenseNumber,
        gradeLevel,
        certification,
        flow: 'signUp',
      });
      setError('');
      router.push('/teacher');
      // Optionally redirect or show success
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center">
      <Card className="w-full md:w-3xl">
        <CardHeader className="ml-8">
          <CardTitle className="text-[30px]">Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
              <TriangleAlertIcon className="size-4" />
              {error}
            </div>
          )}
          <form onSubmit={onRegister} className="space-y-8">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  id="profile-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border border-gray-400">
                      <AvatarImage
                        className="avatar-image"
                        src={previewUrl || '/placeholder.svg'}
                        alt={`photo uploaded by user`}
                      />
                    </Avatar>

                    {isUploading ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader2Icon className="h-5 w-5 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Uploading...
                        </span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setImage(null);
                          setPreviewUrl(null);

                          const input = document.getElementById(
                            'profile-image-upload'
                          ) as HTMLInputElement | null;
                          if (input) input.value = '';
                        }}
                        variant="ghost"
                      >
                        Change Photo
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="cursor-pointer flex flex-col items-center">
                    <Image
                      width={87}
                      height={97}
                      className="gap-2"
                      onClick={() =>
                        document.getElementById('profile-image-upload')?.click()
                      }
                      src="/images/profile-icon.svg"
                      alt="user icon"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload Profile Picture
                    </p>
                  </div>
                )}

                {/* {isUploading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CameraIcon className="h-4 w-4" />
                  Change Photo
                </>
              )} */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-x-8 w-full space-y-6">
              <div className="mb-0">
                <p className="font-semibold">Full name</p>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="First Name"
                    className="rounded-r-none"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    className="rounded-l-none"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold mb-2">Grade Level Taught</p>
                <Select
                  value={gradeLevel}
                  onValueChange={setGradeLevel}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade9">Grade 9</SelectItem>
                    <SelectItem value="grade10">Grade 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-x-8 w-full space-y-6">
              <div className="mb-0">
                <p className="font-semibold">Email Address</p>
                <div className="flex">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold mb-2">Password</p>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-x-8 w-full space-y-6">
              <div className="mb-0">
                <p className="font-semibold">Teaching License Number</p>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="e.g., 12345678"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold mb-2">Confirm Password</p>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="w-full max-w-4xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* File Upload Section */}
                <div className="space-y-2 flex flex-col">
                  <Label
                    htmlFor="file-upload"
                    className="text-sm font-medium text-gray-900"
                  >
                    Upload Certifications
                  </Label>
                  <div className="relative">
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white w-[300px]">
                      <div className="bg-gray-100 px-3 py-2 border-r border-gray-300 text-sm font-medium text-gray-700 min-w-[100px] flex items-center justify-center">
                        Choose File
                      </div>
                      <div className="flex-1 px-3 py-2 text-sm text-gray-500 bg-white">
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkboxes Section */}
                <div className="space-y-3 mx-auto">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreements.terms}
                      onCheckedChange={() => handleCheckboxChange('terms')}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </a>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={agreements.privacy}
                      onCheckedChange={() => handleCheckboxChange('privacy')}
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={agreements.newsletter}
                      onCheckedChange={() => handleCheckboxChange('newsletter')}
                    />
                    <label
                      htmlFor="newsletter"
                      className="text-sm text-gray-700"
                    >
                      Subscribe to newsletter
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center items-center">
              <Button className="w-full sm:w-[300px]" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <Separator />

          <div className="flex items-center">
            Already have an account?{' '}
            <Button
              onClick={() => setState('signIn')}
              className="text-blue-600"
              variant="ghost"
            >
              Login Here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
