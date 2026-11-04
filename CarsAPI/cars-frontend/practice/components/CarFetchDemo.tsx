"use client";

import { useEffect, useState } from "react";

type Car = {
    id: number;
    make: string;
    model: string;
    year: number;
    isAvailable: boolean;
    horsepower: number;
};

export default function CarFetchDemo() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const response = await fetch(
            "https://localhost:7059/cars",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load data");
        }

        const data: Car[] = await response.json();
        setCars(data);
      } catch {
        if (!controller.signal.aborted) {
          setError("Could not retrieve data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
      <div>
          <h2>Cars from CarsAPI</h2>

          {cars.map(car => (
              <p key={car.id}>
                  {car.make} {car.model} ({car.year})
                  {" — "}
                  {car.isAvailable ? "Available" : "Sold"}
              </p>
          ))}
      </div>
  );
}
