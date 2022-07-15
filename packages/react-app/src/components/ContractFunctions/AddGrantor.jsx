
export default async function AddGrantor(tx, writeContracts, newGrantorAddr) {
  console.log("ayyye you pushed the button");

  const res = async (tx, writeContracts, newGrantorAddr) => {
    const result = tx(writeContracts.SimpleT.addGrantor(newGrantorAddr), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);;
  }

  return  res
}





