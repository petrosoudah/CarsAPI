"use client";

import { Toaster, toast, type ExternalToast } from "sonner";
import { useTranslations } from "next-intl";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface CustomToastOptions extends ExternalToast {
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function useToast() {
    const t = useTranslations("Toast");

    const showToast = (
        type: ToastType,
        message: string,
        options?: CustomToastOptions
    ) => {
        const baseOptions: ExternalToast = {
            duration: type === "error" ? 6000 : 4000,
            action: options?.action
                ? { label: options.action.label, onClick: options.action.onClick }
                : undefined,
            description: options?.description,
        };

        switch (type) {
            case "success":
                return toast.success(message, baseOptions);
            case "error":
                return toast.error(message, baseOptions);
            case "info":
                return toast.info(message, baseOptions);
            case "warning":
                return toast.warning(message, baseOptions);
            case "loading":
                return toast.loading(message, baseOptions);
            default:
                return toast(message, baseOptions);
        }
    };

    return {
        success: (message: string, options?: CustomToastOptions) =>
            showToast("success", message, options),
        error: (message: string, options?: CustomToastOptions) =>
            showToast("error", message, options),
        info: (message: string, options?: CustomToastOptions) =>
            showToast("info", message, options),
        warning: (message: string, options?: CustomToastOptions) =>
            showToast("warning", message, options),
        loading: (message: string, options?: CustomToastOptions) =>
            showToast("loading", message, options),
        promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) =>
            toast.promise(promise, messages),
        dismiss: toast.dismiss,
    };
}

export function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            theme="system"
            className="toaster-group"
            toastOptions={{
                classNames: {
                    toast: "group toast-custom",
                    description: "toast-description",
                    actionButton: "toast-action",
                    closeButton: "toast-close",
                },
            }}
        />
    );
}