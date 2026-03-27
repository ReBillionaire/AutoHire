"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    createOrg: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, createOrg: checked, orgName: checked ? prev.orgName : "" }));
  };

  const validateForm = (): boolean => {
    setFormError(null);
    if (!formData.name.trim() || formData.name.length < 2) { setFormError("Name must be at least 2 characters"); return false; }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setFormError("Please enter a valid email address"); return false; }
    if (formData.password.length < 8) { setFormError("Password must be at least 8 characters"); return false; }
    if (formData.password !== formData.confirmPassword) { setFormError("Passwords do not match"); return false; }
    if (formData.createOrg && (!formData.orgName.trim() || formData.orgName.length < 2)) { setFormError("Organization name must be at least 2 characters"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          orgName: formData.createOrg ? formData.orgName : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) { setFormError(data.error || "Registration failed."); return; }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      router.push(signInResult?.ok ? "/dashboard" : "/login");
    } catch (error) {
      setFormError("An error occurred. Please try again.");
      console.error("[REGISTER_ERROR]", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Get started with AutoHire</p>
        </div>

        {/* Error */}
        {formError && (
          <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/5">
            <p className="text-xs text-destructive">{formError}</p>
          </div>
        )}

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
              <Input id="name" name="name" type="text" autoComplete="name" required placeholder="John Doe" value={formData.name} onChange={handleInputChange} disabled={isLoading} className="mt-1.5 h-10" />
            </div>

            <div>
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={formData.email} onChange={handleInputChange} disabled={isLoading} className="mt-1.5 h-10" />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Min. 8 characters" value={formData.password} onChange={handleInputChange} disabled={isLoading} className="mt-1.5 h-10" />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Repeat password" value={formData.confirmPassword} onChange={handleInputChange} disabled={isLoading} className="mt-1.5 h-10" />
            </div>

            {/* Organization */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox id="createOrg" checked={formData.createOrg} onCheckedChange={handleCheckboxChange} disabled={isLoading} />
                <Label htmlFor="createOrg" className="text-xs cursor-pointer text-foreground">Create a new organization</Label>
              </div>
              {formData.createOrg && (
                <div>
                  <Label htmlFor="orgName" className="text-xs text-muted-foreground">Organization Name</Label>
                  <Input id="orgName" name="orgName" type="text" placeholder="Acme Corp" value={formData.orgName} onChange={handleInputChange} disabled={isLoading} className="mt-1.5 h-10" />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">Terms</a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
