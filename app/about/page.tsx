import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Instagram, Linkedin, Mail, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "About | IT Community Forum",
  description: "Learn more about the IT Community Forum and its creator",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* About the Creator */}
        <div className="lg:col-span-8">
          <h1 className="mb-6 text-3xl font-bold tracking-tight">About the Creator</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">👋 Hi, I'm Ivan Goranov</CardTitle>
              <CardDescription className="text-lg">Frontend Developer | Student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                I'm passionate about creating exceptional user experiences and turning complex problems into elegant solutions.
              </p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">🌐 Contact Information</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a href="https://www.igoranov.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.igoranov.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href="mailto:contact@igoranov.com" className="text-primary hover:underline">
                      contact@igoranov.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">🛠️ Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">JavaScript</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">React.js</Badge>
                  <Badge variant="outline">Next.js</Badge>
                  <Badge variant="outline">HTML5</Badge>
                  <Badge variant="outline">CSS3</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                  <Badge variant="outline">VS Code</Badge>
                  <Badge variant="outline">Git</Badge>
                  <Badge variant="outline">GitHub</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Currently Learning: Advanced React Patterns & Web Performance Optimization</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">🏆 Achievements</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>National competition "Technology, Creativity, Entrepreneurship" - 1st Place (2020, 2021)</li>
                  <li>National IT competition, Blagoevgrad - Multiple 1st Places</li>
                  <li>National competition "IT-Znayko" - 1st Place</li>
                  <li>National competition "John Atanasov" - 1st Place</li>
                  <li>Fifth Session of the Student Institute of BAS - 2nd Place</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">🚀 Featured Projects</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Blog Platform</strong> - Social media-like application with React.js</li>
                  <li><strong>Nutrition Calculator</strong> - Personalized meal planning tool</li>
                  <li><strong>Portfolio Website</strong> - Modern Next.js showcase with animations</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">📫 Let's Connect</h3>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.linkedin.com/in/ivan-goranov/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                  </a>
                  <a href="https://github.com/IvanGoranov02" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  </a>
                  <a href="https://www.instagram.com/ivgoranov/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                  </a>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  💼 Currently working as a front-end developer at <a href="https://fidweb.net/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Fidweb</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* About the Forum */}
        <div className="lg:col-span-4">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">About IT Community Forum</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                IT Community Forum is a platform for IT professionals, developers, and tech enthusiasts to connect, share knowledge, and grow together. We aim to create a supportive environment where members can discuss programming languages, frameworks, career advice, and the latest trends in technology.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Join Our Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Become a part of our growing community of tech professionals. Share your expertise, ask questions, and collaborate on exciting projects.
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/register">
                  <Button className="w-full">Create an Account</Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground">
                  Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Have questions or suggestions? We'd love to hear from you!
              </p>
              <Link href="mailto:contact@itforums.org">
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  contact@itforums.org
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 