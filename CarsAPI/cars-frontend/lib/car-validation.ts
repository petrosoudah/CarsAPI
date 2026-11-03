export type CarFormValues = {
    make: string;
    model: string;
    year: string;
    horsepower: string;
    price: string;
    color: string;
};

export type ValidationKey = "required" | "max50" | "year" | "horsepower" | "price" | "color";
export type CarFieldErrors = Partial<Record<keyof CarFormValues, ValidationKey>>;

export function validateCar(values: CarFormValues, currentYear = new Date().getFullYear()): CarFieldErrors {
    const errors: CarFieldErrors = {};
    for (const field of ["make", "model"] as const) {
        if (!values[field].trim()) errors[field] = "required";
        else if (values[field].trim().length > 50) errors[field] = "max50";
    }
    if (!values.year.trim()) errors.year = "required";
    else if (!Number.isInteger(Number(values.year)) || Number(values.year) < 1886 || Number(values.year) > currentYear + 1) {
        errors.year = "year";
    }
    if (!values.horsepower.trim()) errors.horsepower = "required";
    else if (!Number.isInteger(Number(values.horsepower)) || Number(values.horsepower) <= 0 || Number(values.horsepower) > 2147483647) {
        errors.horsepower = "horsepower";
    }
    if (values.price.trim() && (!Number.isFinite(Number(values.price)) || Number(values.price) < 0 || Number(values.price) > 79228162514264337593543950335)) {
        errors.price = "price";
    }
    if (values.color.trim().length > 30) errors.color = "color";
    return errors;
}
