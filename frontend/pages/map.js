import StallReservation from "../components/StallReservation";
import ViewStallReservation from "../components/ViewStallReservation";
import { useState, useEffect } from 'react';

export default function MapPage() {

  const [user, setUser] = useState(null);

  useEffect(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="m-0 p-0 font-sans overflow-x-hidden">
      {isAdmin ? <ViewStallReservation /> : <StallReservation />}
    </div>
  );
}
