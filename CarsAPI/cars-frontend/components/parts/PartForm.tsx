"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addPart, getCarsForPartForm, PartValidationError, updatePart, type Part } from "@/lib/api/parts-api";
import { validatePart, type PartField, type PartFieldErrors, type PartFormValues } from "@/lib/validation/part-validation";
import { queryKeys } from "@/lib/api/query-keys";
import useTranslatedError from "@/hooks/useTranslatedError";

type PartFormProps = {
    part?: Part | null;
    onSaved: () => void;
    onSavingChange?: (saving: boolean) => void;
};

export default function PartForm({ part = null, onSaved, onSavingChange }: PartFormProps) {
    const t = useTranslations("Parts");
    const validation = useTranslations("PartValidation");
    const translateError = useTranslatedError();
    const [values, setValues] = useState<PartFormValues>({
        manufacturer: part?.manufacturer ?? "",
        description: part?.description ?? "",
        price: part?.price?.toString() ?? "",
        carId: part?.carId?.toString() ?? "",
    });
    const carsQuery = useQuery({
        queryKey: queryKeys.carOptions,
        queryFn: ({ signal }) => getCarsForPartForm(signal),
    });
    const cars = carsQuery.data ?? [];
    const carsLoading = carsQuery.isFetching;
    const carsError = carsQuery.error instanceof Error ? carsQuery.error.message : "";
    const save = useMutation({
        mutationFn: async (details: { manufacturer: string; description: string; price: number; carId: number | null }) => {
            if (part) await updatePart(part.id, details);
            else await addPart(details);
        },
    });
    const saving = save.isPending;
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<PartFieldErrors>({});
    const [serverErrors, setServerErrors] = useState<Partial<Record<PartField, string>>>({});

    function changeField(name: PartField, value: string) {
        setValues(previous => ({ ...previous, [name]: value }));
        setFieldErrors(previous => ({ ...previous, [name]: undefined }));
        setServerErrors(previous => ({ ...previous, [name]: undefined }));
        setError("");
    }

    function fieldMessage(name: PartField) {
        const key = fieldErrors[name];
        return key ? validation(key) : serverErrors[name];
    }

    function focusFirst(form: HTMLFormElement, errors: object) {
        const name = Object.keys(errors)[0];
        const input = name ? form.elements.namedItem(name) : null;
        if (input instanceof HTMLElement) input.focus();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        const form = event.currentTarget;
        const errors = validatePart(values);
        setFieldErrors(errors);
        setServerErrors({});
        setError("");
        if (Object.keys(errors).length) {
            setError("Please enter valid part details.");
            focusFirst(form, errors);
            return;
        }

        onSavingChange?.(true);
        try {
            const details = {
                manufacturer: values.manufacturer.trim(),
                description: values.description.trim(),
                price: Number(values.price),
                carId: values.carId === "" ? null : Number(values.carId),
            };
            await save.mutateAsync(details);

            setValues({ manufacturer: "", description: "", price: "", carId: "" });
            onSaved();
        } catch (err) {
            if (err instanceof PartValidationError) {
                const mapped: Partial<Record<PartField, string>> = {};
                for (const [field, messages] of Object.entries(err.fields)) {
                    const name = (Object.keys(values) as PartField[])
                        .find(name => name.toLowerCase() === field.toLowerCase());
                    if (name) mapped[name] = messages.join(" ");
                }
                setServerErrors(mapped);
                setError(Object.keys(mapped).length ? "Please enter valid part details." : err.message);
                requestAnimationFrame(() => focusFirst(form, mapped));
            } else {
                setError(err instanceof Error ? err.message : part ? "Could not update part." : "Could not add part.");
            }
        } finally {
            onSavingChange?.(false);
        }
    }

    const textFields = [
        { name: "manufacturer", label: "manufacturer", maxLength: 100 },
        { name: "description", label: "description", maxLength: 500 },
        { name: "price", label: "priceLabel" },
    ] as const;
    const carMessage = fieldMessage("carId");

    return (
        <form onSubmit={handleSubmit} noValidate aria-labelledby="part-form-title"
            className="space-y-4 rounded-xl border p-4">
            <h2 id="part-form-title" className="text-xl font-semibold">{t(part ? "edit" : "add")}</h2>
            <fieldset disabled={saving} className="space-y-4">
                {carsLoading && <p role="status">{t("loadingCars")}</p>}
                {carsError && (
                    <div className="space-y-2">
                        <p role="alert" className="text-destructive">{translateError(carsError)}</p>
                        <Button type="button" variant="outline" onClick={() => {
                            void carsQuery.refetch();
                        }}>{t("retryCars")}</Button>
                    </div>
                )}
                <div className="space-y-2">
                    <label htmlFor="part-car">{t("carOptional")}</label>
                    <select id="part-car" name="carId" value={values.carId}
                        onChange={event => changeField("carId", event.target.value)}
                        disabled={carsLoading || Boolean(carsError) || saving}
                        aria-invalid={Boolean(carMessage)}
                        aria-describedby={carMessage ? "part-car-error" : undefined}
                        className="w-full rounded-md border bg-background p-2 text-foreground">
                        <option value="">{t("unassigned")}</option>
                        {values.carId && !cars.some(car => String(car.id) === values.carId) && (
                            <option value={values.carId}>{part?.carName ?? t("selectedCar", { id: values.carId })}</option>
                        )}
                        {cars.map(car => <option key={car.id} value={car.id}>
                            {car.make} {car.model} ({car.year})
                        </option>)}
                    </select>
                    {carMessage && <p id="part-car-error" className="text-sm text-destructive">{carMessage}</p>}
                </div>
                {textFields.map(field => {
                    const message = fieldMessage(field.name);
                    return (
                        <div key={field.name} className="space-y-2">
                            <label htmlFor={"part-" + field.name}>{t(field.label)}</label>
                            <Input id={"part-" + field.name} name={field.name}
                                type={field.name === "price" ? "number" : "text"}
                                min={field.name === "price" ? 0 : undefined}
                                step={field.name === "price" ? "0.01" : undefined}
                                maxLength={"maxLength" in field ? field.maxLength : undefined}
                                required value={values[field.name]}
                                onChange={event => changeField(field.name, event.target.value)}
                                aria-invalid={Boolean(message)}
                                aria-describedby={message ? "part-" + field.name + "-error" : undefined} />
                            {message && <p id={"part-" + field.name + "-error"} className="text-sm text-destructive">{message}</p>}
                        </div>
                    );
                })}
                {error && <p role="alert" className="text-destructive">{translateError(error)}</p>}
                <Button type="submit" disabled={saving}>{t(saving ? "saving" : part ? "save" : "add")}</Button>
            </fieldset>
        </form>
    );
}
