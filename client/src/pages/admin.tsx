import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Users,
  Key,
  IndianRupee,
  Mail,
  TrendingUp,
  MoreHorizontal,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  UserX,
  Send as SendIcon,
  Copy,
  Check,
  MessageSquare,
  Download,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, License, Purchase, ContactMessage, CommunityPost } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  activeLicenses: number;
  totalRevenue: number;
  newMessages: number;
}

interface CommunityPostWithUser extends CommunityPost {
  userName: string;
  userEmail: string;
}

interface DownloadSettings {
  enabled: boolean;
  totalDownloads: number;
  limit: number;
  remaining: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [licensePlan, setLicensePlan] = useState("personal");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === "admin",
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin",
  });

  const { data: allLicenses, isLoading: licensesLoading } = useQuery<License[]>({
    queryKey: ["/api/admin/licenses"],
    enabled: user?.role === "admin",
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/admin/purchases"],
    enabled: user?.role === "admin",
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/messages"],
    enabled: user?.role === "admin",
  });

  const { data: licenseHistory, isLoading: licenseHistoryLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/license-history"],
    enabled: user?.role === "admin",
  });

  const { data: devices, isLoading: devicesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/devices"],
    enabled: user?.role === "admin",
  });

  const { data: communityPosts, isLoading: communityLoading } = useQuery<CommunityPostWithUser[]>({
    queryKey: ["/api/admin/community/posts"],
    enabled: user?.role === "admin",
  });

  const { data: downloadSettings, isLoading: downloadSettingsLoading } = useQuery<DownloadSettings>({
    queryKey: ["/api/admin/download-settings"],
    enabled: user?.role === "admin",
  });

  const markMessageReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("PATCH", `/api/admin/messages/${messageId}`, { status: "read" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("DELETE", `/api/admin/messages/${messageId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Message deleted" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}/delete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const sendLicenseMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/send-license", {
        userId: selectedUserId,
        licenseKey,
        plan: licensePlan,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/licenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUserId("");
      setLicenseKey("");
      setLicensePlan("personal");
      toast({ title: "License sent successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send license", description: error.message, variant: "destructive" });
    },
  });

  const deleteCommunityPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("DELETE", `/api/admin/community/posts/${postId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community/posts"] });
      toast({ title: "Feedback deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete feedback", description: error.message, variant: "destructive" });
    },
  });

  const toggleDownloadMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiRequest("POST", "/api/admin/download-settings/toggle", { enabled });
      return enabled;
    },
    onSuccess: (enabled: boolean) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/download-settings"] });
      toast({ title: enabled ? "Downloads enabled" : "Downloads disabled" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update setting", description: error.message, variant: "destructive" });
    },
  });

  const resetDownloadsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/download-settings/reset", {});
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/download-settings"] });
      toast({ title: "Downloads reset", description: `Reset ${data?.deletedCount || 0} download records` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reset downloads", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex p-4 rounded-full bg-destructive/10 mb-4">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, licenses, and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-stat-users">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-licenses">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Licenses</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.activeLicenses || 0}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Key className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-revenue">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold">
                      ₹{(stats?.totalRevenue || 0).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <IndianRupee className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-messages">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Messages</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold">{stats?.newMessages || 0}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="send-license" data-testid="tab-send-license">Send License</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">License History</TabsTrigger>
            <TabsTrigger value="licenses" data-testid="tab-licenses">Licenses</TabsTrigger>
            <TabsTrigger value="purchases" data-testid="tab-purchases">Purchases</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
            <TabsTrigger value="community" data-testid="tab-community">Community</TabsTrigger>
            <TabsTrigger value="downloads" data-testid="tab-downloads">Downloads</TabsTrigger>
          </TabsList>

          {/* Send License Tab */}
          <TabsContent value="send-license">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SendIcon className="h-5 w-5" />
                  Send License to User
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-md space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select User</label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Plan Type</label>
                  <Select value={licensePlan} onValueChange={setLicensePlan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal (₹1,999)</SelectItem>
                      <SelectItem value="pro">Pro (₹4,999)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">License Key</label>
                  <Input
                    placeholder="e.g., QSEC-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    data-testid="input-license-key"
                  />
                </div>

                <Button
                  onClick={() => sendLicenseMutation.mutate()}
                  disabled={!selectedUserId || !licenseKey || sendLicenseMutation.isPending}
                  className="w-full"
                  data-testid="button-send-license"
                >
                  {sendLicenseMutation.isPending ? "Sending..." : "Send License"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License History Tab */}
          <TabsContent value="history">
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Keys Sent</p>
                        <p className="text-2xl font-bold">{licenseHistory?.length || 0}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Purchases</p>
                        <p className="text-2xl font-bold">{purchases?.length || 0}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <IndianRupee className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Admin Sent</p>
                        <p className="text-2xl font-bold">
                          {(licenseHistory?.length || 0) - (purchases?.filter((p: any) => p.status === "completed")?.length || 0)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <SendIcon className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    License Key History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {licenseHistoryLoading || purchasesLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : licenseHistory && licenseHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>License Key</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {licenseHistory.map((entry: any) => {
                          const relatedPurchase = purchases?.find((p: any) => 
                            p.userId === entry.userId && 
                            p.plan === entry.plan && 
                            p.status === "completed"
                          );
                          const isPurchased = !!relatedPurchase;
                          
                          return (
                            <TableRow key={entry.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{entry.userName}</p>
                                  <p className="text-xs text-muted-foreground">{entry.userEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`capitalize ${
                                    entry.plan === "pro" ? "border-amber-500 text-amber-500" : 
                                    entry.plan === "enterprise" ? "border-purple-500 text-purple-500" : 
                                    "border-primary text-primary"
                                  }`}
                                >
                                  {entry.plan}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                  {entry.licenseKey}
                                </code>
                              </TableCell>
                              <TableCell>
                                {isPurchased ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    <IndianRupee className="h-3 w-3 mr-1" />
                                    Purchased
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    <SendIcon className="h-3 w-3 mr-1" />
                                    Admin Sent
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(entry.sentAt).toLocaleDateString()}
                                <br />
                                <span className="text-xs">
                                  {new Date(entry.sentAt).toLocaleTimeString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(entry.licenseKey);
                                    setCopiedId(entry.id);
                                    toast({ title: "License key copied!" });
                                    setTimeout(() => setCopiedId(null), 2000);
                                  }}
                                >
                                  {copiedId === entry.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No licenses sent yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Purchases Detail Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Purchase Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {purchasesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : purchases && purchases.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchases.map((purchase: any) => {
                          const purchaseUser = users?.find((u: any) => u.id === purchase.userId);
                          return (
                            <TableRow key={purchase.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{purchaseUser?.name || "Unknown"}</p>
                                  <p className="text-xs text-muted-foreground">{purchaseUser?.email || "Unknown"}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`capitalize ${
                                    purchase.plan === "pro" ? "border-amber-500 text-amber-500" : 
                                    purchase.plan === "enterprise" ? "border-purple-500 text-purple-500" : 
                                    "border-primary text-primary"
                                  }`}
                                >
                                  {purchase.plan}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-emerald-500">
                                ₹{Number(purchase.amount).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    purchase.status === "completed" 
                                      ? "bg-emerald-500/10 text-emerald-500" 
                                      : purchase.status === "pending"
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : "bg-red-500/10 text-red-500"
                                  }
                                >
                                  {purchase.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                  {purchase.transactionId || "N/A"}
                                </code>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(purchase.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No purchases yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>User Management</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-users"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((u) => (
                        <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-user-menu-${u.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${u.name}? This cannot be undone.`)) {
                                      deleteUserMutation.mutate(u.id);
                                    }
                                  }}
                                  disabled={deleteUserMutation.isPending}
                                  className="text-destructive focus:text-destructive"
                                  data-testid={`button-delete-user-${u.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>License Management</CardTitle>
              </CardHeader>
              <CardContent>
                {licensesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : allLicenses && allLicenses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>License Key</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Devices</TableHead>
                        <TableHead>Purchased</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allLicenses.map((license) => (
                        <TableRow key={license.id} data-testid={`row-license-${license.id}`}>
                          <TableCell className="font-mono text-sm">
                            {license.licenseKey.slice(0, 12)}...
                          </TableCell>
                          <TableCell className="capitalize">{license.plan}</TableCell>
                          <TableCell>
                            <Badge
                              variant={license.status === "active" ? "default" : "secondary"}
                              className={license.status === "active" ? "bg-primary/10 text-primary" : ""}
                            >
                              {license.status === "active" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {license.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {license.deviceCount}/{license.maxDevices}
                          </TableCell>
                          <TableCell>
                            {new Date(license.purchaseDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No licenses found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                {purchasesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : purchases && purchases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id} data-testid={`row-purchase-${purchase.id}`}>
                          <TableCell className="capitalize font-medium">
                            {purchase.plan}
                          </TableCell>
                          <TableCell>
                            ₹{Number(purchase.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={purchase.status === "completed" ? "default" : "secondary"}
                              className={purchase.status === "completed" ? "bg-primary/10 text-primary" : ""}
                            >
                              {purchase.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No purchases found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card
                        key={message.id}
                        className={message.status === "new" ? "border-primary/50" : ""}
                        data-testid={`card-message-${message.id}`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold">{message.name}</p>
                                {message.status === "new" && (
                                  <Badge variant="default" className="text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {message.email}
                              </p>
                              <p className="text-sm">{message.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(message.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {message.status === "new" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markMessageReadMutation.mutate(message.id)}
                                  data-testid={`button-mark-read-${message.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteMessageMutation.mutate(message.id)}
                                data-testid={`button-delete-${message.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Community Feedbacks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {communityLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : communityPosts && communityPosts.length > 0 ? (
                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <Card key={post.id} className="border" data-testid={`card-community-${post.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold">{post.title}</p>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {post.category}
                                </Badge>
                                <Badge 
                                  variant={post.status === "open" ? "default" : "secondary"}
                                  className="text-xs capitalize"
                                >
                                  {post.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                By: {post.userName} ({post.userEmail})
                              </p>
                              <p className="text-sm">{post.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {new Date(post.createdAt).toLocaleString()}
                                </span>
                                <span>Upvotes: {post.upvotes}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this feedback?")) {
                                  deleteCommunityPostMutation.mutate(post.id);
                                }
                              }}
                              disabled={deleteCommunityPostMutation.isPending}
                              data-testid={`button-delete-community-${post.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No community feedbacks found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Free macOS Download Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                {downloadSettingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Downloads</p>
                            <p className="text-3xl font-bold">{downloadSettings?.totalDownloads || 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Remaining</p>
                            <p className="text-3xl font-bold">{downloadSettings?.remaining || 20}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Limit</p>
                            <p className="text-3xl font-bold">{downloadSettings?.limit || 20}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Free Downloads</p>
                              <p className="text-sm text-muted-foreground">
                                {downloadSettings?.enabled 
                                  ? "Users can download the free macOS version" 
                                  : "Free downloads are currently disabled"}
                              </p>
                            </div>
                            <Button
                              variant={downloadSettings?.enabled ? "destructive" : "default"}
                              onClick={() => toggleDownloadMutation.mutate(!downloadSettings?.enabled)}
                              disabled={toggleDownloadMutation.isPending}
                              data-testid="button-toggle-downloads"
                            >
                              {downloadSettings?.enabled ? (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Reset Download Count</p>
                              <p className="text-sm text-muted-foreground">
                                Clear all download records and reset the counter to 0
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (confirm("Are you sure you want to reset all download records? This will allow all users to download again.")) {
                                  resetDownloadsMutation.mutate();
                                }
                              }}
                              disabled={resetDownloadsMutation.isPending}
                              data-testid="button-reset-downloads"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reset Count
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
