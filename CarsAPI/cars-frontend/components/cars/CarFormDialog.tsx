"use client";

import { useState, useRef, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import useTranslatedError from "@/hooks/useTranslatedError";
import { CarValidationError, saveCar, type Car } from "@/lib/api/cars-api";
import { validateCar, type CarFieldErrors, type CarFormValues } from "@/lib/validation/car-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CarFormDialogProps = {
    car: Car | null;
    onClose: () => void;
    onSaved: (car: Car) => void;
};

export default function CarFormDialog({ car, onClose, onSaved }: CarFormDialogProps) {
    const t = useTranslations("Form");
    const common = useTranslations("Common");
    const validation = useTranslations("Validation");
    const translateError = useTranslatedError();
    const [values, setValues] = useState<CarFormValues>({
        make: car?.make ?? "", model: car?.model ?? "",
        year: car ? String(car.year) : "", horsepower: car ? String(car.horsepower) : "",
        price: car?.price?.toString() ?? "", color: car?.color ?? "",
    });
    const initialValues = useRef(values);
    const [fieldErrors, setFieldErrors] = useState<CarFieldErrors>({});
    const [serverErrors, setServerErrors] = useState<Partial<Record<keyof CarFormValues, string>>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const maxYear = new Date().getFullYear() + 1;

    function focusField(form: HTMLFormElement, errors: object) {
        const first = Object.keys(errors)[0];
        const input = first ? form.elements.namedItem(first) : null;
        if (input instanceof HTMLElement) input.focus();
    }

    function updateField(name: keyof CarFormValues, value: string) {
        setValues(previous => ({ ...previous, [name]: value }));
        setFieldErrors(previous => ({ ...previous, [name]: undefined }));
        setServerErrors(previous => ({ ...previous, [name]: undefined }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        const form = event.currentTarget;
        const errors = validateCar(values);
        setFieldErrors(errors);
        setServerErrors({});
        setError("");
        if (Object.keys(errors).length > 0) {
            setError("Please enter valid car details.");
            focusField(form, errors);
            return;
        }

        setSaving(true);
        try {
            const savedCar = await saveCar({
                make: values.make.trim(), model: values.model.trim(),
                year: Number(values.year), horsepower: Number(values.horsepower),
                price: values.price.trim() === "" ? null : Number(values.price),
                color: values.color.trim() || null,
            }, car);
            onSaved(savedCar);
        } catch (err) {
            if (err instanceof CarValidationError) {
                const mapped: Partial<Record<keyof CarFormValues, string>> = {};
                for (const [field, messages] of Object.entries(err.fields)) {
                    const name = field.toLowerCase() as keyof CarFormValues;
                    if (Object.hasOwn(values, name)) mapped[name] = messages.join(" ");
                }
                setServerErrors(mapped);
                setError(Object.keys(mapped).length > 0 ? "Please enter valid car details." : err.message);
                // Wait until disabled controls have been re-enabled.
                requestAnimationFrame(() => focusField(form, mapped));
            } else {
                setError(err instanceof Error ? err.message : "Could not save car.");
            }
        } finally {
            setSaving(false);
        }
    }

    const fields: {
        name: keyof CarFormValues; type: "text" | "number"; placeholder: string;
        required?: boolean; maxLength?: number; min?: number; max?: number; step?: string;
    }[] = [
        { name: "make", type: "text", placeholder: t("makePlaceholder"), required: true, maxLength: 50 },
        { name: "model", type: "text", placeholder: t("modelPlaceholder"), required: true, maxLength: 50 },
        { name: "year", type: "number", placeholder: t("yearPlaceholder"), required: true, min: 1886, max: maxYear, step: "1" },
        { name: "horsepower", type: "number", placeholder: "150", required: true, min: 1, max: 2147483647, step: "1" },
        { name: "price", type: "number", placeholder: "20000", min: 0, step: "0.01" },
        { name: "color", type: "text", placeholder: t("colorPlaceholder"), maxLength: 30 },
    ];
    function hasUnsavedChanges() {
        return Object.keys(values).some(key => {
            const field = key as keyof CarFormValues;

            return values[field] !== initialValues.current[field];

        })

      
    }
    function requestClose() {
        if (saving) return;
        if (hasUnsavedChanges()) {
            const discard = window.confirm(t("discardConfirm"));
            if (!discard) return;
        }
        onClose();
    }
    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) requestClose();
            }}
        >            <DialogContent className="max-h-[85dvh] overflow-y-auto" closeLabel={common("close")} showCloseButton={!saving}>
                <DialogHeader>
                    <DialogTitle>{t(car ? "editTitle" : "addTitle")}</DialogTitle>
                    <DialogDescription>{t(car ? "editDescription" : "addDescription")}
                        {" "}

                        {t("requiredHint")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {fields.map(({ name, placeholder, ...attributes }) => {
                        const message = fieldErrors[name]
                            ? validation(fieldErrors[name], { maxYear })
                            : serverErrors[name];
                        const hintId = name === "year" ? "car-year-hint" : undefined;
                        const errorId = message ? "car-" + name + "-error" : undefined;
                        return (
                            <div key={name} className="space-y-2">
                                <label htmlFor={"car-" + name} className="text-sm font-medium">{t(name)}</label>
                                <Input {...attributes} id={"car-" + name} name={name} placeholder={placeholder}
                                    disabled={saving} value={values[name]}
                                    onChange={event => updateField(name, event.target.value)}
                                    aria-invalid={Boolean(message)}
                                    aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined} />
                                {name === "year" && (
                                    <p id={hintId} className="text-sm text-muted-foreground">
                                        {t("yearHint", { maxYear })}
                                    </p>
                                )}
                                {message && <p id={"car-" + name + "-error"} className="text-sm text-destructive">{message}</p>}
                              
                            </div>
                        );
                    })}
                    
                    {error && <p role="alert" className="text-sm text-destructive">{translateError(error)}</p>}
                    <div className="flex flex-wrap justify-end gap-2">
                        <DialogClose disabled={saving} render={<Button type="button" variant="outline" />}>
                            {common("cancel")}
                        </DialogClose>
                        <Button type="submit" disabled={saving}>{t(saving ? "saving" : car ? "save" : "add")}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
