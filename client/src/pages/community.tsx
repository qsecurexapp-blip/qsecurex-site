import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCommunityPostSchema, type InsertCommunityPost, type CommunityPost } from "@shared/schema";
import { MessageSquare, ThumbsUp, AlertCircle, Lightbulb, CheckCircle, Bug, ArrowRight } from "lucide-react";

const categoryIcons = {
  complaint: AlertCircle,
  suggestion: Lightbulb,
  feedback: MessageSquare,
  "bug-report": Bug,
};

const categoryColors = {
  complaint: "bg-red-500/10 text-red-500",
  suggestion: "bg-blue-500/10 text-blue-500",
  feedback: "bg-purple-500/10 text-purple-500",
  "bug-report": "bg-orange-500/10 text-orange-500",
};

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const form = useForm<InsertCommunityPost>({
    resolver: zodResolver(insertCommunityPostSchema),
    defaultValues: { title: "", content: "", category: "suggestion" },
  });

  const { data: posts, isLoading } = useQuery<CommunityPost[]>({
    queryKey: selectedCategory === "all" ? ["/api/community/posts"] : ["/api/community/posts", selectedCategory],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: InsertCommunityPost) => {
      const response = await apiRequest("POST", "/api/community/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      form.reset();
      setShowForm(false);
      toast({ title: "Post created!", description: "Thank you for your feedback." });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("POST", `/api/community/posts/${postId}/upvote`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const filteredPosts = selectedCategory === "all" ? posts : posts?.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">Community Feedback</h1>
            <p className="text-xl text-muted-foreground">Share your complaints, suggestions, and feedback with us.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {!user ? (
            <Card className="mb-8 bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <Link href="/register">
                  <Button className="glow-primary">Sign up to share feedback</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Share Your Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <Button onClick={() => setShowForm(true)} className="w-full">
                    Write a new post
                  </Button>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
                      <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="content" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Details</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your feedback..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="complaint">Complaint</SelectItem>
                              <SelectItem value="suggestion">Suggestion</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="bug-report">Bug Report</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="flex gap-2">
                        <Button type="submit" disabled={createPostMutation.isPending}>
                          Post {createPostMutation.isPending && "..."}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "complaint", "suggestion", "feedback", "bug-report"].map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredPosts?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No posts yet. Be the first!</div>
            ) : (
              filteredPosts?.map((post) => {
                const Icon = categoryIcons[post.category as keyof typeof categoryIcons];
                return (
                  <Card key={post.id} className="hover-elevate" data-testid={`card-post-${post.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className={categoryColors[post.category as keyof typeof categoryColors]}>
                              {Icon && <Icon className="h-3 w-3 mr-1" />}
                              {post.category}
                            </Badge>
                            <Badge variant="outline" className={post.status === "open" ? "bg-green-500/10" : ""}>{post.status}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                          <p className="text-muted-foreground mb-3">{post.content}</p>
                          <p className="text-xs text-muted-foreground">Posted {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => upvoteMutation.mutate(post.id)} data-testid={`button-upvote-${post.id}`}>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.upvotes}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
