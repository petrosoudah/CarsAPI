"use client";

import { Button } from "../components/ui/button";

type CarPriceProps = {
    make: string;
    model: string;
    price: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onReset: () => void;
    onPriceChange: (newPrice: number) => void;

};

export default function CarPrice(props: CarPriceProps) {

    return (
        <div>
            <h2>{props.make} {props.model}</h2>

            
            <p>Price: ${props.price}</p>

            <Button onClick={props.onIncrease}>
                Increase Price
            </Button>
            <Button onClick={props.onDecrease}>
                Decrease Price
            </Button>
            <Button variant="outline" onClick={props.onReset}>
                Reset Price
            </Button>
            <p>
                {props.price < 2000 && "Budget-friendly!"}
                {props.price > 2000 && props.price <= 5000 && "Affordable!"}
                {props.price > 5000 && "Expensive!"}
            </p>
            <input
                type="number"
                value={props.price}
                onChange={(event) =>
                    props.onPriceChange(Number(event.target.value))
                }
            />
               
        </div>
    );
}