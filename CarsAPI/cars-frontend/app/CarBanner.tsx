import Image from "next/image";
import bannerPhoto from "../public/car-banner.jpg";

export default function CarBanner() {
    return (
        <div className="relative h-48 w-full overflow-hidden rounded-xl sm:h-72">
            <Image
                src={bannerPhoto}
                alt="Car banner for the Cars dashboard"
                fill
                sizes="100vw"
                className="object-cover"
            />
        </div>
    );
}