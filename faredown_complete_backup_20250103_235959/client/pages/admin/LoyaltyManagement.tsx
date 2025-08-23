import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient as api } from "@/lib/api";

interface LoyaltyRule {
  id: string;
  ruleType: "EARNING" | "REDEMPTION";
  category: "HOTEL" | "FLIGHT";
  pointsPerAmount: number;
  minAmount: number;
  maxPoints?: number;
  active: boolean;
  validFrom: string;
  validTo?: string;
}

interface TierRule {
  id: string;
  tierName: string;
  minPoints: number;
  maxPoints?: number;
  multiplier: number;
  benefits: string[];
  active: boolean;
}

interface LoyaltyMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  currentPoints: number;
  lifetimeEarned: number;
  currentTier: string;
  tierProgress: number;
  joinedAt: string;
  lastActivity: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

export default function LoyaltyManagement() {
  const [activeTab, setActiveTab] = useState("rules");
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [tiers, setTiers] = useState<TierRule[]>([]);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<LoyaltyRule | null>(null);
  const [editingTier, setEditingTier] = useState<TierRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === "rules") {
      fetchRules();
    } else if (activeTab === "tiers") {
      fetchTiers();
    } else if (activeTab === "members") {
      fetchMembers();
    }
  }, [activeTab]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/loyalty/rules");
      setRules(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch loyalty rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/loyalty/tiers");
      setTiers(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tier rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/loyalty/members", {
        params: { search: searchTerm },
      });
      setMembers(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch loyalty members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async (rule: Partial<LoyaltyRule>) => {
    try {
      if (editingRule) {
        await api.put(`/api/admin/loyalty/rules/${editingRule.id}`, rule);
        toast({
          title: "Success",
          description: "Loyalty rule updated successfully",
        });
      } else {
        await api.post("/api/admin/loyalty/rules", rule);
        toast({
          title: "Success",
          description: "Loyalty rule created successfully",
        });
      }
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save loyalty rule",
        variant: "destructive",
      });
    }
  };

  const saveTier = async (tier: Partial<TierRule>) => {
    try {
      if (editingTier) {
        await api.put(`/api/admin/loyalty/tiers/${editingTier.id}`, tier);
        toast({
          title: "Success",
          description: "Tier rule updated successfully",
        });
      } else {
        await api.post("/api/admin/loyalty/tiers", tier);
        toast({
          title: "Success",
          description: "Tier rule created successfully",
        });
      }
      setEditingTier(null);
      fetchTiers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tier rule",
        variant: "destructive",
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      await api.delete(`/api/admin/loyalty/rules/${ruleId}`);
      toast({
        title: "Success",
        description: "Loyalty rule deleted successfully",
      });
      fetchRules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete loyalty rule",
        variant: "destructive",
      });
    }
  };

  const updateMemberStatus = async (memberId: string, status: string) => {
    try {
      await api.patch(`/api/admin/loyalty/members/${memberId}`, { status });
      toast({
        title: "Success",
        description: "Member status updated successfully",
      });
      fetchMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      });
    }
  };

  const adjustMemberPoints = async (
    memberId: string,
    points: number,
    reason: string,
  ) => {
    try {
      await api.post(`/api/admin/loyalty/members/${memberId}/adjust-points`, {
        points,
        reason,
        type: points > 0 ? "MANUAL_CREDIT" : "MANUAL_DEBIT",
      });
      toast({
        title: "Success",
        description: "Member points adjusted successfully",
      });
      fetchMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust member points",
        variant: "destructive",
      });
    }
  };

  const RuleForm = ({
    rule,
    onSave,
    onCancel,
  }: {
    rule?: LoyaltyRule | null;
    onSave: (rule: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      ruleType: rule?.ruleType || "EARNING",
      category: rule?.category || "HOTEL",
      pointsPerAmount: rule?.pointsPerAmount || 0,
      minAmount: rule?.minAmount || 0,
      maxPoints: rule?.maxPoints || "",
      active: rule?.active ?? true,
      validFrom: rule?.validFrom || new Date().toISOString().split("T")[0],
      validTo: rule?.validTo || "",
    });

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{rule ? "Edit" : "Create"} Loyalty Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ruleType">Rule Type</Label>
              <Select
                value={formData.ruleType}
                onValueChange={(value) =>
                  setFormData({ ...formData, ruleType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EARNING">Earning</SelectItem>
                  <SelectItem value="REDEMPTION">Redemption</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOTEL">Hotel</SelectItem>
                  <SelectItem value="FLIGHT">Flight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pointsPerAmount">Points per ₹100</Label>
              <Input
                type="number"
                value={formData.pointsPerAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pointsPerAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
              <Input
                type="number"
                value={formData.minAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minAmount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxPoints">Max Points (optional)</Label>
              <Input
                type="number"
                value={formData.maxPoints}
                onChange={(e) =>
                  setFormData({ ...formData, maxPoints: e.target.value })
                }
                placeholder="No limit"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <Label>Active</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="validTo">Valid To (optional)</Label>
              <Input
                type="date"
                value={formData.validTo}
                onChange={(e) =>
                  setFormData({ ...formData, validTo: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)}>Save Rule</Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TierForm = ({
    tier,
    onSave,
    onCancel,
  }: {
    tier?: TierRule | null;
    onSave: (tier: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      tierName: tier?.tierName || "",
      minPoints: tier?.minPoints || 0,
      maxPoints: tier?.maxPoints || "",
      multiplier: tier?.multiplier || 1,
      benefits: tier?.benefits?.join("\n") || "",
      active: tier?.active ?? true,
    });

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{tier ? "Edit" : "Create"} Tier Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tierName">Tier Name</Label>
              <Input
                value={formData.tierName}
                onChange={(e) =>
                  setFormData({ ...formData, tierName: e.target.value })
                }
                placeholder="e.g., Bronze, Silver, Gold"
              />
            </div>
            <div>
              <Label htmlFor="multiplier">Points Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.multiplier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    multiplier: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPoints">Minimum Points</Label>
              <Input
                type="number"
                value={formData.minPoints}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minPoints: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="maxPoints">Maximum Points (optional)</Label>
              <Input
                type="number"
                value={formData.maxPoints}
                onChange={(e) =>
                  setFormData({ ...formData, maxPoints: e.target.value })
                }
                placeholder="No limit for highest tier"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="benefits">Benefits (one per line)</Label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={formData.benefits}
              onChange={(e) =>
                setFormData({ ...formData, benefits: e.target.value })
              }
              placeholder="Priority support\nExtra baggage allowance\nFree room upgrades"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
            <Label>Active</Label>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                onSave({
                  ...formData,
                  benefits: formData.benefits
                    .split("\n")
                    .filter((b) => b.trim()),
                })
              }
            >
              Save Tier
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MemberAdjustmentDialog = ({
    member,
    onSave,
  }: {
    member: LoyaltyMember;
    onSave: (points: number, reason: string) => void;
  }) => {
    const [points, setPoints] = useState(0);
    const [reason, setReason] = useState("");

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            Adjust Points
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adjust Points for {member.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Current Balance: {member.currentPoints} points
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="points">Points Adjustment</Label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value))}
                placeholder="Positive to add, negative to deduct"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Customer service gesture, points correction"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onSave(points, reason)}
              disabled={!reason.trim()}
            >
              Adjust Points
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Loyalty Management</h1>
        <p className="text-muted-foreground">
          Configure loyalty rules, tiers, and manage members
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Loyalty Rules</TabsTrigger>
          <TabsTrigger value="tiers">Tier Management</TabsTrigger>
          <TabsTrigger value="members">Member Management</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Loyalty Rules</h2>
            <Button onClick={() => setEditingRule({} as LoyaltyRule)}>
              Create New Rule
            </Button>
          </div>

          {editingRule && (
            <RuleForm
              rule={editingRule}
              onSave={saveRule}
              onCancel={() => setEditingRule(null)}
            />
          )}

          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            rule.ruleType === "EARNING"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {rule.ruleType}
                        </Badge>
                        <Badge variant="outline">{rule.category}</Badge>
                        <Badge
                          variant={rule.active ? "default" : "destructive"}
                        >
                          {rule.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        {rule.pointsPerAmount} points per ₹100 spend
                        {rule.minAmount > 0 && ` (min ₹${rule.minAmount})`}
                        {rule.maxPoints && ` (max ${rule.maxPoints} points)`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Valid: {rule.validFrom}{" "}
                        {rule.validTo && `- ${rule.validTo}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Loyalty Rule
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the loyalty rule.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRule(rule.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tier Management</h2>
            <Button onClick={() => setEditingTier({} as TierRule)}>
              Create New Tier
            </Button>
          </div>

          {editingTier && (
            <TierForm
              tier={editingTier}
              onSave={saveTier}
              onCancel={() => setEditingTier(null)}
            />
          )}

          <div className="grid gap-4">
            {tiers.map((tier) => (
              <Card key={tier.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{tier.tierName}</h3>
                        <Badge
                          variant={tier.active ? "default" : "destructive"}
                        >
                          {tier.active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {tier.multiplier}x Multiplier
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {tier.minPoints} - {tier.maxPoints || "∞"} points
                      </p>
                      {tier.benefits.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Benefits:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {tier.benefits.map((benefit, index) => (
                              <li key={index}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTier(tier)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Member Management</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button onClick={fetchMembers}>Search</Button>
            </div>
          </div>

          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{member.name}</h3>
                        <Badge variant="outline">{member.currentTier}</Badge>
                        <Badge
                          variant={
                            member.status === "ACTIVE"
                              ? "default"
                              : member.status === "SUSPENDED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {member.email}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Current Points:</span>{" "}
                          {member.currentPoints}
                        </div>
                        <div>
                          <span className="font-medium">Lifetime Earned:</span>{" "}
                          {member.lifetimeEarned}
                        </div>
                        <div>
                          <span className="font-medium">Tier Progress:</span>{" "}
                          {member.tierProgress}%
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mt-2">
                        <div>
                          Joined:{" "}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                        <div>
                          Last Activity:{" "}
                          {new Date(member.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MemberAdjustmentDialog
                        member={member}
                        onSave={(points, reason) =>
                          adjustMemberPoints(member.id, points, reason)
                        }
                      />
                      <Select
                        value={member.status}
                        onValueChange={(status) =>
                          updateMemberStatus(member.id, status)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
