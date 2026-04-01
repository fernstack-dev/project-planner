"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, User, Mail, Camera, CheckCircle, XCircle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStep, setEmailStep] = useState("input"); // input, verify
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        avatarUrl: session.user.avatarUrl || "",
      });
    }
    setLoading(false);
  }, [session, status, router]);

  const handleAvatarClick = () => {
    const avatarField = document.getElementById("avatarUrl");
    if (avatarField) avatarField.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          avatarUrl: formData.avatarUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
      await update({ name: formData.name, avatarUrl: formData.avatarUrl });
      setSuccessMessage("Профиль обновлён");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setError("Введите корректный email");
      return;
    }
    setEmailStep("verify");
    setSuccessMessage("Код подтверждения отправлен на новый email (демо-код: 123456)");
  };

  const handleVerifyEmail = async () => {
    if (emailCode !== "123456") {
      setError("Неверный код подтверждения");
      return;
    }
    setSuccessMessage("Email успешно изменён");
    setFormData({ ...formData, email: newEmail });
    setShowEmailChange(false);
    setEmailStep("input");
    setNewEmail("");
    setEmailCode("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-400 hover:text-gray-300 transition-colors rounded-none"
          >
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к проектам
            </Link>
          </Button>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-none">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-20 w-20 border-2 border-emerald-500/50">
                <AvatarImage src={formData.avatarUrl || "/avatar-placeholder.jpg"} alt={formData.name} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-2xl">
                  {formData.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{formData.name || "Пользователь"}</h1>
              <p className="text-sm text-gray-400">{formData.email}</p>
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 rounded-none">
              <CheckCircle className="h-4 w-4" />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 rounded-none">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 text-sm">Имя</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-700 focus:border-emerald-500 rounded-none"
                required
              />
            </div>

            {/* Email field (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-10 bg-gray-800 border-gray-700 cursor-not-allowed opacity-75 rounded-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEmailChange(!showEmailChange)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {showEmailChange ? "Отмена" : "Изменить email"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-gray-300 text-sm">URL аватара</Label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="avatarUrl"
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="pl-10 bg-gray-800 border-gray-700 focus:border-emerald-500 rounded-none"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors rounded-none w-full"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </form>

          {showEmailChange && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Смена email</h3>
              {emailStep === "input" ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="newEmail" className="text-gray-300 text-sm">Новый email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700 rounded-none"
                      placeholder="new@example.com"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleRequestEmailChange}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-none"
                  >
                    Отправить код подтверждения
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="emailCode" className="text-gray-300 text-sm">Код подтверждения</Label>
                    <Input
                      id="emailCode"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      className="bg-gray-800 border-gray-700 rounded-none"
                      placeholder="Введите код из письма"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="bg-emerald-600 hover:bg-emerald-700 rounded-none"
                    >
                      Подтвердить
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEmailStep("input");
                        setNewEmail("");
                      }}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-none"
                    >
                      Назад
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}