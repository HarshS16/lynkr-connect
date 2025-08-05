import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function Landing() {
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const bio = formData.get('bio') as string;

    if (fullName.length < 2 || fullName.length > 50) {
      toast({
        title: "Invalid name",
        description: "Name must be between 2 and 50 characters",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, bio);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-90"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="text-white space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Welcome to{' '}
                <span className="text-white/90">Lynkr</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Connect with professionals, share your thoughts, and build your network. 
                Join thousands of users sharing knowledge and growing together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Professional networking</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Share insights</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Build connections</span>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Forms */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="pb-4">
                      <CardTitle>Welcome back</CardTitle>
                      <CardDescription>
                        Sign in to your Lynkr account to continue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <Input
                            id="signin-password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loading}
                        >
                          {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="signup">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="pb-4">
                      <CardTitle>Create account</CardTitle>
                      <CardDescription>
                        Join Lynkr and start building your professional network
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-fullname">Full Name</Label>
                          <Input
                            id="signup-fullname"
                            name="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            minLength={2}
                            maxLength={50}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            name="password"
                            type="password"
                            placeholder="Create a password (min. 8 characters)"
                            minLength={8}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-bio">Bio (Optional)</Label>
                          <Textarea
                            id="signup-bio"
                            name="bio"
                            placeholder="Tell us about yourself..."
                            maxLength={500}
                            rows={3}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loading}
                        >
                          {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why choose Lynkr?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for professionals who want to connect, share, and grow together
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Network</h3>
              <p className="text-muted-foreground">
                Connect with like-minded professionals and expand your network
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Insights</h3>
              <p className="text-muted-foreground">
                Share your thoughts, experiences, and insights with the community
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Grow Together</h3>
              <p className="text-muted-foreground">
                Learn from others and contribute to a growing community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}