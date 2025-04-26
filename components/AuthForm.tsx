"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormField } from "@/components/ui/form"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import React, { useRef, useState } from "react"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { auth } from "@/firebase/client"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
    profilePicture: z.any().optional(),
    resume: z.any().optional(),
  })
}

type FormType = "sign-in" | "sign-up";

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  //  Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      profilePicture: undefined,
      resume: undefined,
    },
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("profilePicture", file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setResumeFile(file);
      form.setValue("resume", file);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      const provider = new GoogleAuthProvider();
      const userCredentials = await signInWithPopup(auth, provider);
      const idToken = await userCredentials.user.getIdToken();
      const { displayName, email, photoURL, uid } = userCredentials.user;
      
      if (type === "sign-in") {
        // Sign in with Google
        await signIn({
          email: email!,
          idToken
        });
      } else {
        // Sign up with Google
        await signUp({
          uid,
          name: displayName || "User",
          email: email!,
          password: "", // Password not needed for Google auth
          profilePictureUrl: photoURL || "",
          resumeURL: ""
        });
      }
      
      toast.success('Authentication successful');
      router.push('/');
    } catch (error: Error | unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Google authentication failed: ${errorMessage}`);
    } finally {
      setIsAuthenticating(false);
    }
  };
  // Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsAuthenticating(true);
      
      if (type === 'sign-up') {
        const { name, email, password, profilePicture, resume } = values;
        
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredentials.user.uid;

        // Upload profile picture if exists
        let profilePictureUrl = "";
        if (profilePicture instanceof File) {
          const storage = getStorage();
          const profileRef = ref(storage, `users/${uid}/profile/${profilePicture.name}`);
          await uploadBytes(profileRef, profilePicture);
          profilePictureUrl = await getDownloadURL(profileRef);
        }

        // Upload resume if exists
        let resumeUrl = "";
        if (resume instanceof File) {
          const storage = getStorage();
          const resumeRef = ref(storage, `users/${uid}/resume/${resume.name}`);
          await uploadBytes(resumeRef, resume);
          resumeUrl = await getDownloadURL(resumeRef);
        }

        const result = await signUp({
          uid: uid,
          name: name!,
          email,
          password,
          profilePictureUrl: profilePictureUrl,
          resumeURL: resumeUrl
        });

        if (!result?.success) {
          toast.error(result?.message);
          return;
        }
        toast.success('Account Created Successfully');
        router.push('/');
      } else {
        const { email, password } = values;

        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredentials.user.getIdToken();

        if (!idToken) {
          toast.error("Error signing in");
          return;
        }
        await signIn({
          email,
          idToken
        });

        toast.success('Signed in Successfully');
        router.push('/');
      }
    } catch (error: Error | unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Authentication failed: ${errorMessage}`);
      toast.error(`Authentication failed: ${error.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  }
  
  const isSignIn = type === "sign-in";
  
  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 overflow-x-hidden bg-[oklch(0.205_0_0)]">
      <div className="card-border w-full max-w-[566px] mx-auto">
        <div className="flex flex-col gap-6 card py-14 px-6 sm:px-10 overflow-hidden">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo" width={38} height={32} />
            <h2 className="text-primary-100">MockMate</h2>
          </div>
          <h3 className="text-xl font-semibold text-center">Practice job interview with AI</h3>
    
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4">
              {!isSignIn && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <p>Name</p>
                        <div className="relative">
                          <input
                            {...field}
                            placeholder="Enter your name"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                        {fieldState.error && (
                          <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />

                  {/* Profile Picture Upload */}
                  <div className="space-y-2">
                    <p>Profile Picture</p>
                    <div className="flex items-center space-x-4">
                      <div 
                        onClick={() => profileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden"
                      >
                        {profilePreview ? (
                          <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xs text-center">Click to upload</span>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={profileInputRef}
                        onChange={handleProfileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <p className="text-sm text-gray-500">Upload your profile picture (optional)</p>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <p>Resume</p>
                    <div className="flex items-center space-x-4">
                      <div 
                        onClick={() => resumeInputRef.current?.click()}
                        className="w-full p-2 border rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-gray-500">
                          {resumeFile ? resumeFile.name : "Upload your resume (PDF only)"}
                        </span>
                        <span className="text-sm text-primary-100">Browse</span>
                      </div>
                      <input
                        type="file"
                        ref={resumeInputRef}
                        onChange={handleResumeChange}
                        accept=".pdf"
                        className="hidden"
                      />
                    </div>
                    {resumeFile && <p className="text-sm text-green-500">PDF selected</p>}
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <p>Email</p>
                    <div className="relative">
                      <input
                        {...field}
                        placeholder="Enter your Email"
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    {fieldState.error && (
                      <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const [showPassword, setShowPassword] = React.useState(false);
                  return (
                    <div className="space-y-2">
                      <p>Password</p>
                      <div className="relative">
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your Password"
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                        <button 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-xs text-gray-500"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                          }}
                          type="button"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                      )}
                    </div>
                  );
                }}
              />

              <Button 
                className="btn w-full" 
                type="submit" 
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Processing...' : isSignIn ? 'Sign-in' : 'Create an Account'}
              </Button>

              <div className="relative flex items-center justify-center">
                <hr className="w-full border-t border-gray-300" />
                <span className="absolute bg-white px-2 text-xs text-gray-500">OR</span>
              </div>

                  <Button 
                  type="button" 
                  className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100" 
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  >
                  <Image src="/google.svg" alt="Google" width={20} height={20} />
                  Continue with Google
                  </Button>
            </form>
          </Form>
          <p className="text-center">
            {isSignIn ? 'No account yet?' : 'Have an account already?'}{' '}
            <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary">
              {!isSignIn ? "Sign-in" : 'Sign-up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default AuthForm;