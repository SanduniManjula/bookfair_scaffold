import {useEffect,useState} from 'react';

export default function MapPage(){
  const [stalls,setStalls]=useState([]);
  useEffect(()=>{fetch('http://localhost:8080/api/reservations/available').then(r=>r.json()).then(setStalls)},[]);
  return (<div style={{padding:20}}>
    <h2>Venue Map (simple)</h2>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      {stalls.length===0 && <div>Loading stalls from backend...</div>}
      {stalls.map(s=>(
        <div key={s.id} style={{width:120,height:80,border:'1px solid #333',padding:8,opacity:s.reserved?0.4:1}}>
          <strong>{s.name}</strong><div>{s.size}</div>
          <button onClick={()=>{fetch(`http://localhost:8080/api/reservations/reserve?userId=1&stallId=${s.id}`,{method:'POST'}).then(r=>r.json()).then(alert)}} disabled={s.reserved}>Reserve</button>
        </div>
      ))}
    </div>
  </div>)
}
