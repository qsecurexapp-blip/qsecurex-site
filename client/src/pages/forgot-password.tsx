import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { z } from "zod";
import logoImage from "@assets/app_icon_1024_1764268476863.png";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      toast({
        title: "Check your email",
        description: "If your account exists, you'll receive a password reset link shortly.",
      });
      setSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-card to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="QSecureX" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {submitted 
              ? "Check your email for reset instructions"
              : "Enter your email to receive password reset instructions"
            }
          </p>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                          data-testid="input-forgot-password-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-forgot-password-submit"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Email
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a password reset link to your email. Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Didn't receive an email? Check your spam folder or try again.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            data-testid="link-back-to-login"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
