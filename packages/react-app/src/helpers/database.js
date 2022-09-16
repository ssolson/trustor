export async function updateTrustBlockchainValues(trust_address, trustValues) {
  await fetch(`http://localhost:5000/trust/sync/${trust_address}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trustValues),
  }).catch(error => {
    window.alert(error);
    return;
  });
}

export async function addNewTrust(newTrust) {
  await fetch("http://localhost:5000/trust/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTrust),
  }).catch(error => {
    window.alert(error);
    return;
  });
}

/**
 * Get method to return all trust addresses associated with a user
 * @param {string} userAddress Address to request current associated trusts
 * @returns {Object} userData Object of Trust addresses and roles associated with user
 */
export async function getUserTrusts(userAddress) {
  const response = await fetch(`http://localhost:5000/user/${userAddress}`);

  if (!response.ok) {
    const message = `An error occurred: ${response.statusText}`;
    window.alert(message);
    return;
  } else {
    const userData = await response.json();
    return userData;
  }
}

/**
 * Get method to return trust data  associated with a trust address
 * @param {string} trustAddress Address to request trust data
 * @returns {Object} trustData Object of trust data
 */
export async function getTrustData(trustAddress) {
  const response = await fetch(`http://localhost:5000/trust/${trustAddress}`);

  if (!response.ok) {
    const message = `An error occurred: ${response.statusText}`;
    window.alert(message);
    return;
  } else {
    const trustData = await response.json();
    return trustData;
  }
}
