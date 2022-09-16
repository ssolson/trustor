import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import ReactDOM from "react-dom";
// import { Page, Text, Image, Document, StyleSheet } from "@react-pdf/renderer";
import { Button } from "antd";
import "./PDFFile.css";
import trustLang from "../templates/trustTemplate.json";
import trustMD from "../templates/eg/content/shortTrust.md";

// TODO: Get Data from Database
const trustData = {
  trustCreationDate: "05 September 2022",
  trustName: "Trust 1",
  jurisdiction: "Virginia",
  grantorName: "Grant Thor",
  initialTrusteeName: "Trust Steve",
  successorTrusteeNames: "Trust Steve",
  beneficiaryNames: ["Bene Gesserit"],
  beneficiaryShares: [100],
  beneficiaryNameShares: {},
};

const beneficiaryNameShares = trustData["beneficiaryNames"].forEach((key, i) => {
  trustData["beneficiaryNameShares"][key] = trustData["beneficiaryShares"][i];
});

export default function PDFFile(props) {
  // console.log('trustData', trustData);
  const [template, setTemplate] = React.useState();
  const [trust, setTrust] = React.useState();

  useEffect(() => {
    fetch(trustMD)
      .then(res => res.text())
      .then(res => setTemplate(res))
      .then(() => {
        let trustWithData = template;
        if (trustWithData) {
          for (const [key, value] of Object.entries(trustData)) {
            trustWithData = trustWithData.replaceAll(String(key), String(value));
          }
          setTrust(trustWithData);
        }
      });
  }, [template]);

  return (
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />
      <h1>THE TRUST</h1>
      <ReactMarkdown children={trust}></ReactMarkdown>
      <div>
        <Button
          type={"primary"}
          onClick={async () => {
            console.log("You clicked the button!");
            // console.log("trustLang", typeof  trustLang['data'][0]['contents'])
          }}
        >
          Click it
        </Button>
      </div>
    </div>
  );
}

// const styles = StyleSheet.create({
//   body: {
//     paddingTop: 35,
//     paddingBottom: 65,
//     paddingHorizontal: 35,
//   },
//   title: {
//     fontSize: 24,
//     textAlign: "center",
//   },
//   text: {
//     margin: 12,
//     fontSize: 14,
//     textAlign: "justify",
//     fontFamily: "Times-Roman",
//   },
//   image: {
//     marginVertical: 15,
//     marginHorizontal: 100,
//   },
//   header: {
//     fontSize: 12,
//     marginBottom: 20,
//     textAlign: "center",
//     color: "grey",
//   },
//   pageNumber: {
//     position: "absolute",
//     fontSize: 12,
//     bottom: 30,
//     left: 0,
//     right: 0,
//     textAlign: "center",
//     color: "grey",
//   },
// });

{
  /* <Document>
        <Page style={styles.body}>
          <Text style={styles.header} fixed></Text>
          <Text style={styles.text}>
          Preface

          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </Page>
      </Document> */
}
