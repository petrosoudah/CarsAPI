"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addPart, getCarsForPartForm, updatePart, type Part } from "@/lib/parts-api";
import type { Car } from "@/lib/cars-api";
import { useTranslations } from "next-intl";
import useTranslatedError from "@/components/cars/useTranslatedError";


export default function PartForm({
    part = null,
    onSaved,
}: {
    part?: Part | null;
    onSaved: () => void;
    }) {
    const t = useTranslations("Parts");
    const translateError = useTranslatedError();
    const [carId, setCarId] = useState(
        part?.carId?.toString() ?? ""
    );
    const [cars, setCars] = useState<Car[]>([]);
    const [carsLoading, setCarsLoading] = useState(true);
    const [carsError, setCarsError] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [manufacturer, setManufacturer] = useState(
        part?.manufacturer ?? ""
    );
    const [description, setDescription] = useState(
        part?.description ?? ""
    );
    const [price, setPrice] = useState(
        part?.price?.toString() ?? ""
    );
    useEffect(() => {
        const controller = new AbortController();

        async function loadCars() {
            try {
                const data = await getCarsForPartForm(controller.signal);

                if (!controller.signal.aborted) {
                    setCars(data);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setCarsError(
                        err instanceof Error ? err.message : "Could not load cars."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCarsLoading(false);
                }
            }
        }

        loadCars();
        return () => controller.abort();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;

        const numericPrice = Number(price);

        if (
            !manufacturer.trim() ||
            !description.trim() ||
            price.trim() === "" ||
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            setError("Please enter valid part details.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const details = {
                manufacturer: manufacturer.trim(),
                description: description.trim(),
                price: numericPrice,
                carId: carId === "" ? null : Number(carId),
            };

            if (part) {
                await updatePart(part.id, details);
            } else {
                await addPart(details);
            }

            setManufacturer("");
            setDescription("");
            setPrice("");
            onSaved();
            setCarId("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Could not add part."
            );
        } finally {
            setSaving(false);
        }
    }

 

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border p-4">
            <h2 className="text-xl font-semibold">{t(part ? "edit" : "add")}</h2>
            {carsLoading && <p role="status">{t("loadingCars")}</p>}

            {
                carsError && (
                    <p role="alert" className="text-destructive">
                        {translateError(carsError)}
                    </p>
                )
            }

            {
                !carsLoading && !carsError && (
                    <div className="space-y-2">
                        <label htmlFor="part-car">{t("carOptional")}</label>
                        <select
                            id="part-car"
                            value={carId}
                            onChange={event => setCarId(event.target.value)}
                            disabled={carsLoading || Boolean(carsError) || saving}
                            className="w-full rounded-md border bg-background p-2 text-foreground"
                        >
                            <option value="">{t("unassigned")}</option>

                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.make} {car.model} ({car.year})
                                </option>
                            ))}
                        </select>
                    </div>
                )
            }

            <div className="space-y-2">
                <label htmlFor="part-manufacturer">{t("manufacturer")}</label>
                <Input
                    id="part-manufacturer"
                    value={manufacturer}
                    onChange={event => setManufacturer(event.target.value)}
                    maxLength={100}
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="part-description">{t("description")}</label>
                <Input
                    id="part-description"
                    value={description}
                    onChange={event => setDescription(event.target.value)}
                    maxLength={500}
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="part-price">{t("priceLabel")}</label>
                <Input
                    id="part-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={event => setPrice(event.target.value)}
                    required
                />
            </div>
            {error && (
                <p role="alert" className="text-destructive">
                    {translateError(error)}
                </p>
            )}
            <Button type="submit" disabled={saving}>
                {t(saving ? "saving" : part ? "save" : "add")}
            </Button>
        </form>
    );
}
