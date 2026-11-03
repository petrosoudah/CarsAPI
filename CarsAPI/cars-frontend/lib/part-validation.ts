export type PartFormValues = {
    manufacturer: string;
    description: string;
    price: string;
    carId: string;
};

export type PartField = keyof PartFormValues;
export type PartValidationKey = "required" | "manufacturerLength" | "descriptionLength" | "price" | "car";
export type PartFieldErrors = Partial<Record<PartField, PartValidationKey>>;

export function validatePart(values: PartFormValues): PartFieldErrors {
    const errors: PartFieldErrors = {};
    if (!values.manufacturer.trim()) errors.manufacturer = "required";
    else if (values.manufacturer.trim().length > 100) errors.manufacturer = "manufacturerLength";
    if (!values.description.trim()) errors.description = "required";
    else if (values.description.trim().length > 500) errors.description = "descriptionLength";
    const price = Number(values.price);
    const cents = price * 100;
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(cents)) * 2;
    if (!values.price.trim()) errors.price = "required";
    else if (!Number.isFinite(price) || price < 0 || price >= 1e16 ||
        Math.abs(cents - Math.round(cents)) > tolerance) errors.price = "price";
    if (values.carId !== "" && (!Number.isSafeInteger(Number(values.carId)) || Number(values.carId) <= 0)) {
        errors.carId = "car";
    }
    return errors;
}
