"use client";

import { useTranslations } from "next-intl";

// Translate the frontend's existing errors without changing the CarsAPI contract.
// Unknown messages (including backend validation details) remain intact.
export default function useTranslatedError() {
    const t = useTranslations("Errors");

    return (message: string) => {
        if (message.startsWith("Could not load parts")) return t("loadParts");
        if (message.startsWith("Could not add part")) return t("addPart");
        if (message.startsWith("Could not update part")) return t("updatePart");
        if (message === "Please enter valid part details.") return t("invalidPartDetails");
        if (message.startsWith("Pagination information is missing.")) return t("pagination");
        if (message.startsWith("Could not load cars")) return t("loadCars");
        if (message.startsWith("Could not load car")) return t("loadCar");
        if (message.startsWith("Could not save car")) return t("save");
        if (message.startsWith("Could not delete car")) return t("delete");
        if (message === "Could not update availability." || message === "Update failed.") {
            return t("availability");
        }
        if (message === "Please enter a valid price.") return t("invalidPrice");
        if (message === "Please enter valid car details.") return t("invalidDetails");
        if (message === "Failed to fetch" || message === "Load failed" ||
            message === "NetworkError when attempting to fetch resource.") {
            return t("network");
        }
        return message;
    };
}
