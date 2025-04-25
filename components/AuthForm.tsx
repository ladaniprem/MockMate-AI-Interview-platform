"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {Form, FormField} from "@/components/ui/form"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import React from "react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { auth } from "@/firebase/client"


const authFormSchema = (type:FormType)=>{
  return z.object({
    name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  })
}

type FormType = "sign-in" | "sign-up";

const AuthForm = ({type}:{type:FormType}) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  //  Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name : "",
      email:"",
      password:"",
    },
  })
 
  // Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if(type==='sign-up'){
        const {name,email,password} = values;
        
        
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

        const result = await signUp({
          uid: userCredentials.user.uid,
          name:name!,
          email,
          password,
        })

        if(!result?.success){
          toast.error(result?.message);
          return ;
        }
        console.log("Sign up values:", values);
        toast.success('Account Created Successfully Please sign in.');
        router.push('/sign-in');
      } else {
        const {email,password} = values;

        const userCredentials = await signInWithEmailAndPassword(auth,email,password);

        const idToken = await userCredentials.user.getIdToken();

        if(!idToken){
           toast.error("Error signing in");
           return;
        }
        await signIn({
          email,
          idToken
        })

        console.log("Sign in values:", values);
        toast.success('Signed in Successfully');
        router.push('/');
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an Error:${error}`);
    }
  }
  const isSignIn = type === "sign-in";
  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 overflow-x-hidden bg-[oklch(0.205_0_0)]">
      <div className="card-border w-full max-w-[566px] mx-auto">
        <div className="flex flex-col gap-6 card py-14 px-6 sm:px-10 overflow-hidden">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo" width={38} height={32}/>
            <h2 className="text-primary-100">MockMate</h2>
          </div>
          <h3 className="text-xl font-semibold text-center">Practice job interview with AI</h3>
    
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4">
              {!isSignIn && (
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

              <Button className="btn w-full" type="submit">{isSignIn ? 'Sign-in' : 'Create an Account'}</Button>
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
  )
}
export default AuthForm;