export const queryKeys = {
    cars: ["cars"] as const,
    carList: (search: string, availability: string, page: number) =>
        ["cars", "list", search, availability, page] as const,
    car: (id: string) => ["cars", "detail", id] as const,
    carOptions: ["cars", "options"] as const,
    parts: ["parts"] as const,
    partList: (page: number) => ["parts", "list", page] as const,
};
