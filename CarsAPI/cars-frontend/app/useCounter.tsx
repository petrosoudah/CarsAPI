import { useState } from 'react'; 

export function useCounter() {
    const [count, setCount] = useState(0);
   
    

    function increment() {
        setCount(prevCount => prevCount + 1);
    }

    return { count, increment };

    
}