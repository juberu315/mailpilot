"use client";

import * as React from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sidebar, Topbar } from "@/features/dashboard/components";
import { useSettingEditPage } from "@/features/setting/hooks/use-setting-edit-page";

export function SettingEditPage() {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const {
        form,
        error,
        isEditable,
        isLoading,
        isSaving,
        formDisabled,
        setIsEditable,
        onChange,
        onAvatarSelect,
        onAvatarReset,
        handleSave,
        handleCancel,
    } = useSettingEditPage();

    return (
        <DashboardLayout sidebar={<Sidebar activeItem="Setting" />} header={<Topbar activeItem="Setting" />}>
            <div className="mx-auto w-full max-w-8xl space-y-6 px-1">
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                Settings
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Edit Admin Profile
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Manage administrator profile details, avatar, email, and password.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                className="h-10 rounded-lg px-4"
                                onClick={() => setIsEditable((prev) => !prev)}
                                disabled={isLoading || isSaving}
                            >
                                {isEditable ? "Disable editing" : "Enable editing"}
                            </Button>

                            <Button
                                className="h-10 rounded-lg px-5 shadow-sm"
                                onClick={handleSave}
                                disabled={isLoading || isSaving || !isEditable}
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                {error ? (
                    <Card className="rounded-xl border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-600 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                        {error}
                    </Card>
                ) : null}

                <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-sm">
                    <div className="border-b border-border/60 bg-muted/20 px-6 py-5">
                        <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update your admin account information below.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col gap-6 border-b border-border/60 pb-6 md:flex-row md:items-center">
                            <Avatar className="size-28 rounded-2xl border border-border/70 shadow-sm">
                                <AvatarImage src={form.avatar || "/images/avatar.png"} alt="Admin avatar" />
                                <AvatarFallback className="rounded-2xl text-lg font-semibold">AD</AvatarFallback>
                            </Avatar>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Admin Photo</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Upload a clear profile photo. JPG, GIF, or PNG. Max size 800K.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onAvatarSelect}
                                        disabled={formDisabled}
                                    />

                                    <Button
                                        type="button"
                                        className="h-10 rounded-lg px-4"
                                        disabled={formDisabled}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Upload new photo
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-lg px-4"
                                        onClick={onAvatarReset}
                                        disabled={formDisabled}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-5 lg:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">First Name</label>
                                <Input
                                    className="h-11 rounded-lg border-border/70 bg-background"
                                    value={form.firstName}
                                    onChange={(event) => onChange("firstName", event.target.value)}
                                    disabled={formDisabled}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Last Name</label>
                                <Input
                                    className="h-11 rounded-lg border-border/70 bg-background"
                                    value={form.lastName}
                                    onChange={(event) => onChange("lastName", event.target.value)}
                                    disabled={formDisabled}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">E-mail</label>
                                <Input
                                    className="h-11 rounded-lg border-border/70 bg-background"
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => onChange("email", event.target.value)}
                                    disabled={formDisabled}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}