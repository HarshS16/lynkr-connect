// import { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { Navigate, Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/hooks/use-toast';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { FcGoogle } from "react-icons/fc";

// // Import Framer Motion
// import { motion, AnimatePresence } from 'framer-motion';
// // Import icons (assuming you have a library like react-icons or lucide-react)
// import { Users, Lightbulb, TrendingUp, Sparkles, Network, User } from 'lucide-react';

// // Animation variants
// const fadeVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
// };

// const staggerContainer = {
//   hidden: {},
//   visible: {
//     transition: {
//       staggerChildren: 0.3,
//     },
//   },
// };

// export default function Landing() {
//   const { user, signUp, signIn, resetPassword, signInWithGoogle } = useAuth();
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [forgotOpen, setForgotOpen] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState('');
//   const [forgotLoading, setForgotLoading] = useState(false);
//   const [fullName, setFullName] = useState('');

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;
//     const fullName = formData.get('fullName') as string;
//     const bio = formData.get('bio') as string;

//     if (fullName.length < 2 || fullName.length > 50) {
//       toast({
//         title: 'Invalid name',
//         description: 'Name must be between 2 and 50 characters',
//         variant: 'destructive',
//       });
//       setLoading(false);
//       return;
//     }

//     const { error } = await signUp(email, password, fullName, bio);

//     if (error) {
//       toast({
//         title: 'Sign up failed',
//         description: error.message,
//         variant: 'destructive',
//       });
//     } else {
//       toast({
//         title: 'Account created!',
//         description: 'Please check your email to verify your account.',
//       });
//     }

//     setLoading(false);
//   };

//   const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;

//     const { error } = await signIn(email, password);

//     if (error) {
//       toast({
//         title: 'Sign in failed',
//         description: error.message,
//         variant: 'destructive',
//       });
//     }

//     setLoading(false);
//   };

//   const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setForgotLoading(true);
//     const { error } = await resetPassword(forgotEmail);
//     if (error) {
//       toast({
//         title: 'Reset failed',
//         description: error.message,
//         variant: 'destructive',
//       });
//     } else {
//       toast({
//         title: 'Reset email sent',
//         description: 'Check your inbox for a password reset link.',
//       });
//       setForgotOpen(false);
//       setForgotEmail('');
//     }
//     setForgotLoading(false);
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       await signInWithGoogle();
//     } catch (error) {
//       toast({
//         title: "Google sign-in failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
//       {/* Navbar */}
//       <motion.nav 
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ type: 'spring', stiffness: 120, damping: 20 }}
//         className="w-full bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-sm z-20 sticky top-0"
//       >
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="font-bold text-3xl text-gray-800 tracking-tight">
//             <a href="#hero" className="hover:text-blue-600 transition-colors">Lynkr</a>
//           </div>
//           <div className="hidden md:flex gap-8 items-center text-gray-600 font-medium">
//             <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
//             <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
//             <a href="#auth" className="hover:text-blue-600 transition-colors">Sign In</a>
//             <a href="#auth" className="ml-4 px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">Sign Up</a>
//           </div>
//           {/* Mobile menu button could go here */}
//         </div>
//       </motion.nav>

//       {/* Main Content */}
//       <main className="flex-1">
//         {/* Hero Section */}
//         <section id="hero" className="relative overflow-hidden pt-24 pb-32">
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-95" />
//           <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-10 blur-3xl" />
//           <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl" />

//           <div className="relative container mx-auto px-4 z-10">
//             <div className="grid lg:grid-cols-2 gap-16 items-center">
//               {/* Left Side - Hero Content */}
//               <motion.div 
//                 initial="hidden"
//                 animate="visible"
//                 variants={staggerContainer}
//                 className="space-y-6 text-center lg:text-left"
//               >
//                 <motion.h1 
//                   variants={fadeVariants}
//                   className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg"
//                 >
//                   Connect. Share. Grow.
//                 </motion.h1>
//                 <motion.p 
//                   variants={fadeVariants}
//                   className="text-xl text-blue-100 font-medium leading-relaxed drop-shadow-sm max-w-xl mx-auto lg:mx-0"
//                 >
//                   Join the professional community where you can build your network, share your expertise, and discover new opportunities.
//                 </motion.p>
//                 <motion.div 
//                   variants={fadeVariants}
//                   className="flex justify-center lg:justify-start gap-4 pt-4"
//                 >
//                   <a href="#auth" className="inline-block px-8 py-3 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-colors">Get Started</a>
//                   <a href="#features" className="inline-block px-8 py-3 text-white font-bold rounded-full border-2 border-white hover:bg-white hover:text-blue-700 transition-colors">Learn More</a>
//                 </motion.div>
//               </motion.div>
              
//               {/* Right Side - Auth Forms */}
//               <motion.div 
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
//                 id="auth" 
//                 className="bg-white rounded-3xl shadow-2xl p-6 md:p-10"
//               >
//                 <Tabs defaultValue="signin" className="w-full">
//                   <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-full p-1 mb-6">
//                     <TabsTrigger value="signin" className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-colors">Sign In</TabsTrigger>
//                     <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-colors">Sign Up</TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="signin">
//                     <Card className="border-0 shadow-none">
//                       <CardHeader className="pb-4">
//                         <CardTitle className="text-2xl font-bold text-gray-800">Welcome back</CardTitle>
//                         <CardDescription>
//                           Sign in to your Lynkr account to continue your journey.
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <form onSubmit={handleSignIn} className="space-y-4">
//                           <div className="space-y-2">
//                             <Label htmlFor="signin-email">Email</Label>
//                             <Input
//                               id="signin-email"
//                               name="email"
//                               type="email"
//                               placeholder="Enter your email"
//                               required
//                               className="border-gray-300 focus:border-blue-500"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="signin-password">Password</Label>
//                             <Input
//                               id="signin-password"
//                               name="password"
//                               type="password"
//                               placeholder="Enter your password"
//                               required
//                               className="border-gray-300 focus:border-blue-500"
//                             />
//                             <Link to="#" onClick={e => { e.preventDefault(); setForgotOpen(true); }} className="text-sm text-blue-600 hover:text-blue-800 transition-colors block text-right">
//                               Forgot password?
//                             </Link>
//                           </div>
//                           <Button 
//                             type="submit" 
//                             className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors" 
//                             disabled={loading}
//                           >
//                             {loading ? 'Signing in...' : 'Sign In'}
//                           </Button>
//                         </form>
//                         {/* Google Sign-In Button */}
//                         <div className="mt-6">
//                           <Button
//                             type="button"
//                             variant="outline"
//                             className="w-full flex items-center justify-center gap-2"
//                             onClick={handleGoogleSignIn}
//                           >
//                             <FcGoogle className="h-5 w-5" />
//                             Sign in with Google
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </TabsContent>

//                   <TabsContent value="signup">
//                     <Card className="border-0 shadow-none">
//                       <CardHeader className="pb-4">
//                         <CardTitle className="text-2xl font-bold text-gray-800">Create an account</CardTitle>
//                         <CardDescription>
//                           Join Lynkr and start building your professional network.
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <form onSubmit={handleSignUp} className="space-y-4">
//                           <div className="space-y-2">
//                             <Label htmlFor="signup-fullname">Full Name</Label>
//                             <Input
//                               id="signup-fullname"
//                               name="fullName"
//                               type="text"
//                               placeholder="Enter your full name"
//                               minLength={2}
//                               maxLength={50}
//                               required
//                               value={fullName}
//                               onChange={(e) => setFullName(e.target.value)}
//                               className="border-gray-300 focus:border-blue-500"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="signup-email">Email</Label>
//                             <Input
//                               id="signup-email"
//                               name="email"
//                               type="email"
//                               placeholder="Enter your email"
//                               required
//                               className="border-gray-300 focus:border-blue-500"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="signup-password">Password</Label>
//                             <Input
//                               id="signup-password"
//                               name="password"
//                               type="password"
//                               placeholder="Create a password (min. 8 characters)"
//                               minLength={8}
//                               required
//                               className="border-gray-300 focus:border-blue-500"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="signup-bio">Bio (Optional)</Label>
//                             <Textarea
//                               id="signup-bio"
//                               name="bio"
//                               placeholder="Tell us about yourself..."
//                               maxLength={500}
//                               rows={3}
//                               className="border-gray-300 focus:border-blue-500"
//                             />
//                           </div>
//                           <Button 
//                             type="submit" 
//                             className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors" 
//                             disabled={loading}
//                           >
//                             {loading ? 'Creating account...' : 'Create Account'}
//                           </Button>
//                         </form>
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                 </Tabs>
//               </motion.div>
//             </div>
//           </div>
//         </section>

//         {/* About Section (New) */}
//         <section id="about" className="py-24 bg-white">
//           <div className="container mx-auto px-4">
//             <div className="grid md:grid-cols-2 gap-12 items-center">
//               <motion.div 
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true, amount: 0.5 }}
//                 variants={fadeVariants}
//                 className="order-2 md:order-1"
//               >
//                 <h2 className="text-4xl font-bold text-gray-800 mb-4">
//                   Our Mission: Empowering Professionals
//                 </h2>
//                 <p className="text-lg text-gray-600 mb-6">
//                   At **Lynkr**, we believe in the power of connection and knowledge sharing. Our platform is designed to be more than just a social network—it's a community where ambitious professionals can find their tribe, exchange valuable insights, and accelerate their career growth.
//                 </p>
//                 <p className="text-lg text-gray-600">
//                   Whether you're a seasoned expert or just starting out, Lynkr provides the tools you need to build meaningful relationships and make a lasting impact.
//                 </p>
//               </motion.div>
//               <motion.div 
//                 initial={{ opacity: 0, x: 50 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true, amount: 0.5 }}
//                 transition={{ duration: 0.8 }}
//                 className="order-1 md:order-2"
//               >
//                 {/* Placeholder for an image or graphic */}
//                 <div className="aspect-video bg-blue-100 rounded-2xl shadow-xl flex items-center justify-center text-blue-800 font-semibold text-lg">
//                   <Network size={64} />
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </section>

//         {/* Features Section */}
//         <section id="features" className="py-24 bg-gray-100">
//           <div className="container mx-auto px-4">
//             <motion.div 
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true, amount: 0.5 }}
//               variants={fadeVariants}
//               className="text-center mb-16"
//             >
//               <h2 className="text-4xl font-bold text-gray-800 mb-4">
//                 What makes Lynkr stand out?
//               </h2>
//               <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//                 We're built for professionals who want to connect, share, and grow together, without the noise.
//               </p>
//             </motion.div>
//             <motion.div
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true, amount: 0.5 }}
//               variants={staggerContainer}
//               className="grid md:grid-cols-3 gap-8"
//             >
//               {/* Feature 1 */}
//               <motion.div 
//                 variants={fadeVariants}
//                 className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-2"
//               >
//                 <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Users size={32} />
//                 </div>
//                 <h3 className="text-xl font-bold mb-2 text-gray-800">Professional Networking</h3>
//                 <p className="text-gray-600">
//                   Connect with like-minded professionals in your industry and expand your network effortlessly.
//                 </p>
//               </motion.div>

//               {/* Feature 2 */}
//               <motion.div 
//                 variants={fadeVariants}
//                 className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-2"
//               >
//                 <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Lightbulb size={32} />
//                 </div>
//                 <h3 className="text-xl font-bold mb-2 text-gray-800">Share Your Insights</h3>
//                 <p className="text-gray-600">
//                   Publish articles, share ideas, and contribute to conversations that matter with a dedicated audience.
//                 </p>
//               </motion.div>

//               {/* Feature 3 */}
//               <motion.div 
//                 variants={fadeVariants}
//                 className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-2"
//               >
//                 <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
//                   <TrendingUp size={32} />
//                 </div>
//                 <h3 className="text-xl font-bold mb-2 text-gray-800">Accelerate Your Career</h3>
//                 <p className="text-gray-600">
//                   Find new opportunities, get career advice from experts, and grow your personal brand.
//                 </p>
//               </motion.div>
//             </motion.div>
//           </div>
//         </section>

//         {/* Call to Action Section (New) */}
//         <section className="py-24 bg-blue-600">
//           <div className="container mx-auto px-4 text-center">
//             <motion.div 
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true, amount: 0.5 }}
//               variants={fadeVariants}
//             >
//               <h2 className="text-4xl font-bold text-white mb-4">
//                 Ready to take the next step?
//               </h2>
//               <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
//                 Join thousands of professionals who are already building a better future together.
//               </p>
//               <a href="#auth" className="inline-block px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-full shadow-xl hover:bg-gray-100 transition-colors transform hover:scale-105">
//                 Sign Up for Free
//               </a>
//             </motion.div>
//           </div>
//         </section>
//       </main>
      
//       {/* Footer */}
//       <footer className="w-full bg-gray-800 text-white py-12">
//         <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
//           <span className="font-bold text-2xl">Lynkr</span>
//           <nav className="flex gap-6 text-sm text-gray-300">
//             <a href="#about" className="hover:text-white transition-colors">About</a>
//             <a href="#features" className="hover:text-white transition-colors">Features</a>
//             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
//             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
//           </nav>
//           <span className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Lynkr. All rights reserved.</span>
//         </div>
//       </footer>

//       <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Reset your password</DialogTitle>
//             <DialogDescription>Enter your email and we'll send you a reset link.</DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleForgotPassword} className="space-y-4">
//             <Input
//               type="email"
//               placeholder="Enter your email"
//               value={forgotEmail}
//               onChange={e => setForgotEmail(e.target.value)}
//               required
//               className="w-full"
//             />
//             <Button type="submit" className="w-full" disabled={forgotLoading}>
//               {forgotLoading ? 'Sending...' : 'Send reset link'}
//             </Button>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Profile Link Button (conditionally rendered if user is logged in) */}
//       {user && (
//         <Link to={user ? `/profile/${user.id}` : "/profile"}>
//           <Button variant="ghost" size="sm">
//             <User className="h-4 w-4 mr-2" />
//             Profile
//           </Button>
//         </Link>
//       )}
//     </div>
//   );
// }


















import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FcGoogle } from "react-icons/fc";
import { Users, Lightbulb, TrendingUp, Network, User } from 'lucide-react';
import * as THREE from 'three';



// 3D Background Component
const ThreeBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create floating geometric shapes
    const geometries = [
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.OctahedronGeometry(0.6),
      new THREE.TetrahedronGeometry(0.7),
    ];

    const materials = [
      new THREE.MeshBasicMaterial({ 
        color: 0x3b82f6, 
        transparent: true, 
        opacity: 0.1,
        wireframe: true 
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x1d4ed8, 
        transparent: true, 
        opacity: 0.08,
        wireframe: true 
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x60a5fa, 
        transparent: true, 
        opacity: 0.06,
        wireframe: true 
      }),
    ];

    const meshes = [];
    
    // Create multiple floating objects
    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.x = (Math.random() - 0.5) * 20;
      mesh.position.y = (Math.random() - 0.5) * 20;
      mesh.position.z = (Math.random() - 0.5) * 20;
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      
      scene.add(mesh);
      meshes.push({
        mesh,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatRange: Math.random() * 2 + 1,
        initialY: mesh.position.y,
      });
    }

    camera.position.z = 8;

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      meshes.forEach(({ mesh, rotationSpeed, floatSpeed, floatRange, initialY }) => {
        mesh.rotation.x += rotationSpeed.x;
        mesh.rotation.y += rotationSpeed.y;
        mesh.rotation.z += rotationSpeed.z;
        
        mesh.position.y = initialY + Math.sin(time * floatSpeed) * floatRange;
      });

      camera.position.x = Math.sin(time * 0.5) * 0.5;
      camera.position.y = Math.cos(time * 0.3) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

export default function Landing() {
  const { user, signUp, signIn, resetPassword, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [activeTab, setActiveTab] = useState('signin');

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
        title: 'Invalid name',
        description: 'Name must be between 2 and 50 characters',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, bio);

    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
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
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotLoading(true);
    const { error } = await resetPassword(forgotEmail);
    if (error) {
      toast({
        title: 'Reset failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Reset email sent',
        description: 'Check your inbox for a password reset link.',
      });
      setForgotOpen(false);
      setForgotEmail('');
    }
    setForgotLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* 3D Background */}
      <ThreeBackground />
      
      {/* Background Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-blue-100/30 -z-5"></div>

      {/* Navbar with Glassmorphism */}
      <nav className="w-full backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg z-20 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-3xl text-blue-900 tracking-tight drop-shadow-sm">
            <a href="#hero" className="hover:text-blue-600 transition-colors">Lynkr</a>
          </div>
          <div className="hidden md:flex gap-8 items-center text-blue-900/80 font-medium">
            <a href="#about" className="hover:text-blue-600 transition-colors backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/20">About</a>
            <a href="#features" className="hover:text-blue-600 transition-colors backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/20">Features</a>
            <a href="#auth" className="hover:text-blue-600 transition-colors backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/20">Sign In</a>
            <a href="#auth" className="ml-4 px-5 py-2 rounded-full bg-blue-600/90 backdrop-blur-sm text-white hover:bg-blue-700/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">Sign Up</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Hero Section with Enhanced Glassmorphism */}
        <section id="hero" className="relative overflow-hidden pt-24 pb-32">
          {/* Floating glass orbs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full backdrop-blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-white/5 rounded-full backdrop-blur-xl animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-300/10 rounded-full backdrop-blur-xl animate-pulse delay-700"></div>

          <div className="relative container mx-auto px-4 z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Hero Content */}
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-blue-900 drop-shadow-lg">
                  Connect. Share. Grow.
                </h1>
                <p className="text-xl text-blue-800/80 font-medium leading-relaxed drop-shadow-sm max-w-xl mx-auto lg:mx-0">
                  Join the professional community where you can build your network, share your expertise, and discover new opportunities.
                </p>
                <div className="flex justify-center lg:justify-start gap-4 pt-4">
                  <a href="#auth" className="inline-block px-8 py-3 bg-blue-600/90 backdrop-blur-sm text-white font-bold rounded-full shadow-lg hover:bg-blue-700/90 transition-all transform hover:scale-105 hover:shadow-xl">Get Started</a>
                  <a href="#features" className="inline-block px-8 py-3 text-blue-900 font-bold rounded-full border-2 border-blue-600/50 backdrop-blur-sm bg-white/20 hover:bg-white/30 hover:border-blue-600 transition-all transform hover:scale-105">Learn More</a>
                </div>
              </div>
              
              {/* Right Side - Auth Forms with Enhanced Glassmorphism */}
              <div id="auth" className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-6 md:p-10 hover:shadow-3xl transition-all duration-500">
                <div className="w-full">
                  {/* Custom Tab Navigation */}
                  <div className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm rounded-full p-1 mb-6 border border-white/30">
                    <button
                      onClick={() => setActiveTab('signin')}
                      className={`rounded-full py-2 px-4 transition-all ${
                        activeTab === 'signin'
                          ? 'bg-blue-600/90 text-white shadow-lg backdrop-blur-sm'
                          : 'text-blue-900/70 hover:text-blue-900 hover:bg-white/20'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`rounded-full py-2 px-4 transition-all ${
                        activeTab === 'signup'
                          ? 'bg-blue-600/90 text-white shadow-lg backdrop-blur-sm'
                          : 'text-blue-900/70 hover:text-blue-900 hover:bg-white/20'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {activeTab === 'signin' && (
                    <div className="border-0 shadow-none">
                      <div className="pb-4">
                        <h3 className="text-2xl font-bold text-blue-900 mb-2">Welcome back</h3>
                        <p className="text-blue-800/70">
                          Sign in to your Lynkr account to continue your journey.
                        </p>
                      </div>
                      <div>
                        <form onSubmit={handleSignIn} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signin-email" className="text-blue-900">Email</Label>
                            <Input
                              id="signin-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              required
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signin-password" className="text-blue-900">Password</Label>
                            <Input
                              id="signin-password"
                              name="password"
                              type="password"
                              placeholder="Enter your password"
                              required
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                            />
                            <button
                              type="button"
                              onClick={() => setForgotOpen(true)}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors block ml-auto"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-blue-600/90 backdrop-blur-sm text-white font-semibold hover:bg-blue-700/90 transition-all shadow-lg hover:shadow-xl" 
                            disabled={loading}
                          >
                            {loading ? 'Signing in...' : 'Sign In'}
                          </Button>
                        </form>
                        {/* Google Sign-In Button */}
                        <div className="mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 border-white/30 bg-white/30 backdrop-blur-sm hover:bg-white/40 text-blue-900"
                            onClick={handleGoogleSignIn}
                          >
                            <FcGoogle className="h-5 w-5" />
                            Sign in with Google
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'signup' && (
                    <div className="border-0 shadow-none">
                      <div className="pb-4">
                        <h3 className="text-2xl font-bold text-blue-900 mb-2">Create an account</h3>
                        <p className="text-blue-800/70">
                          Join Lynkr and start building your professional network.
                        </p>
                      </div>
                      <div>
                        <form onSubmit={handleSignUp} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-fullname" className="text-blue-900">Full Name</Label>
                            <Input
                              id="signup-fullname"
                              name="fullName"
                              type="text"
                              placeholder="Enter your full name"
                              minLength={2}
                              maxLength={50}
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-blue-900">Email</Label>
                            <Input
                              id="signup-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              required
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-blue-900">Password</Label>
                            <Input
                              id="signup-password"
                              name="password"
                              type="password"
                              placeholder="Create a password (min. 8 characters)"
                              minLength={8}
                              required
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-bio" className="text-blue-900">Bio (Optional)</Label>
                            <Textarea
                              id="signup-bio"
                              name="bio"
                              placeholder="Tell us about yourself..."
                              maxLength={500}
                              rows={3}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-blue-600/90 backdrop-blur-sm text-white font-semibold hover:bg-blue-700/90 transition-all shadow-lg hover:shadow-xl" 
                            disabled={loading}
                          >
                            {loading ? 'Creating account...' : 'Create Account'}
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section with Glassmorphism */}
        <section id="about" className="py-24 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-4xl font-bold text-blue-900 mb-4">
                  Our Mission: Empowering Professionals
                </h2>
                <p className="text-lg text-blue-800/80 mb-6">
                  At <strong>Lynkr</strong>, we believe in the power of connection and knowledge sharing. Our platform is designed to be more than just a social network—it's a community where ambitious professionals can find their tribe, exchange valuable insights, and accelerate their career growth.
                </p>
                <p className="text-lg text-blue-800/80">
                  Whether you're a seasoned expert or just starting out, Lynkr provides the tools you need to build meaningful relationships and make a lasting impact.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-video bg-blue-100/30 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl flex items-center justify-center text-blue-800 font-semibold text-lg">
                  <Network size={64} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Enhanced Glassmorphism */}
        <section id="features" className="py-24 relative">
          <div className="absolute inset-0 bg-blue-50/20 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-900 mb-4">
                What makes Lynkr stand out?
              </h2>
              <p className="text-lg text-blue-800/80 max-w-2xl mx-auto">
                We're built for professionals who want to connect, share, and grow together, without the noise.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white/30">
                <div className="w-16 h-16 bg-blue-600/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">Professional Networking</h3>
                <p className="text-blue-800/70">
                  Connect with like-minded professionals in your industry and expand your network effortlessly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white/30">
                <div className="w-16 h-16 bg-green-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Lightbulb size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">Share Your Insights</h3>
                <p className="text-blue-800/70">
                  Publish articles, share ideas, and contribute to conversations that matter with a dedicated audience.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white/30">
                <div className="w-16 h-16 bg-purple-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TrendingUp size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">Accelerate Your Career</h3>
                <p className="text-blue-800/70">
                  Find new opportunities, get career advice from experts, and grow your personal brand.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section with Glassmorphism */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-4">
                Ready to take the next step?
              </h2>
              <p className="text-xl text-blue-800/80 max-w-2xl mx-auto mb-8">
                Join thousands of professionals who are already building a better future together.
              </p>
              <a href="#auth" className="inline-block px-10 py-4 bg-blue-600/90 backdrop-blur-sm text-white font-bold text-lg rounded-full shadow-xl hover:bg-blue-700/90 transition-all transform hover:scale-105 hover:shadow-2xl">
                Sign Up for Free
              </a>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer with Glassmorphism */}
      <footer className="w-full bg-blue-900/20 backdrop-blur-xl border-t border-white/20 text-blue-900 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-2xl">Lynkr</span>
          <nav className="flex gap-6 text-sm text-blue-800/70">
            <a href="#about" className="hover:text-blue-900 transition-colors">About</a>
            <a href="#features" className="hover:text-blue-900 transition-colors">Features</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Terms of Service</a>
          </nav>
          <span className="text-sm text-blue-800/60">&copy; {new Date().getFullYear()} Lynkr. All rights reserved.</span>
        </div>
      </footer>

      {/* Forgot Password Dialog with Glassmorphism */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>Enter your email and we'll send you a reset link.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              required
              className="w-full border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
            />
            <Button 
              type="submit" 
              className="w-full bg-blue-600/90 backdrop-blur-sm text-white font-semibold hover:bg-blue-700/90 transition-all shadow-lg" 
              disabled={forgotLoading}
            >
              {forgotLoading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Link Button (conditionally rendered if user is logged in) */}
      {user && (
        <Link to={user ? `/profile/${user.id}` : "/profile"} className="fixed bottom-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 backdrop-blur-xl border border-white/30 text-blue-900 hover:bg-white/30"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </Link>
      )}
    </div>
  );
}
