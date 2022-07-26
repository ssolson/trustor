import { useState, useEffect } from "react";

export default function AllTrustPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedTrusts, setLoadedTrusts] =  useState([]);

  useEffect(() => {
    fetch(
      'https://trustor-2e1dd-default-rtdb.firebaseio.com/trusts.json'
    ).then(response => {
      return response.json();
    }).then(data =>{
      const trusts =[];
      for (const key in data) {
        const trust = {
        id: key,
        ...data[key]
        }
        trusts.push(trust);
      }
       setIsLoading(false);
       setLoadedTrusts(trusts);
       console.log("THE TRUSTS!!!!",trusts);
    });
  }, []);

  

  return (
    <section>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
      <h1> ALL TRUSTS </h1>
      <ul>
        {loadedTrusts.map((elm) => {
          return <li> {elm.address} </li>;
        })}
      </ul>
    </section>
  );
}
