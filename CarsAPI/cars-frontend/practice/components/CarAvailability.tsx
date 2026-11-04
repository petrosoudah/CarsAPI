import { Button } from "@/components/ui/button";

type CarAvailabilityProps = {
    isAvailable: boolean;
    onToggle: () => void;
};

export default function CarAvailability(props: CarAvailabilityProps) {
       

    
    
    return (

        <div>
            <Button onClick={props.onToggle}>
                {props.isAvailable ? "Mark as Sold" : "Mark as Available"}
            </Button>
        </div>




    );

   

}
    
