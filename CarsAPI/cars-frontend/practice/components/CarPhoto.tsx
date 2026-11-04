"use client";
import { Component } from "react";
import Image from "next/image";
import carPhoto from "@/public/car-banner.jpg";
type CarPhotoProps = {
    caption?: string;
};
export default class CarPhoto extends Component<CarPhotoProps> {
    componentDidMount() {
        console.log("CarPhoto mounted");
    }

    componentDidUpdate() {
        console.log("CarPhoto updated");
    }

    componentWillUnmount() {
        console.log("CarPhoto unmounted");
    }
    render() {
        return (
            <figure>
                <Image
                    src={carPhoto}
                    alt="Car photo for the Cars dashboard"
                    sizes="100vw"
                    className="h-auto w-full rounded-xl"
                />
                <figcaption>{this.props.caption}</figcaption>
            </figure>
        );
    }
}