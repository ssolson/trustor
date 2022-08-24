import React from "react";
import { Page, Text, Image, Document, StyleSheet } from "@react-pdf/renderer";
import './PDFFile.css';

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});



const DocumentComps = [
  {
    id: 0,
    section: 0,
    name: "Preface",
    values: [
      {
        id: 1,
        paragraph: 1,
        name: `This is an express inter vivos trust 
          (i.e., revocable living trust), created this 
          [X day, year], the terms of which are wholly 
          expressed in this instrument, except for those 
          incorporated by reference.`,
        data: {date:'2022-08-23'},
        subparagraph: []
      },
      {
        id: 2,
        paragraph: 2,
        name: `The form of delivery of this trust instrument
          is known as a “smart contract,” which digitally instantiates 
          the terms of this trust instrument for global implementation 
          across all digital and cyber networks, platforms, and systems, 
          which serves to enable the administration of property subject 
          to this trust that is of either digital, physical, or of mixed 
          nature, regardless of medium or media wherein the trust property 
          manifests existence.`,
        data: {},
        subparagraph: []
      }
    ],
  },
  {
    id: 1,
    section: 1,
    name: "Article One",
    values: [
      {
        id: 1,
        paragraph: 1,
        name: `For purposes of identification, this trust is referred to as [name].`,
        data: {name:'jimmy'},
        subparagraph: []
      },
      {
        id: 2,
        paragraph: 2,
        name: `Grantor reserves the power to act on behalf of this trust without limitation, 
          and may amend, restate, or revoke this trust at any time, for any purpose, in whole or 
          in part by republication of this trust in writing, whether expressed digitally or otherwise, 
          and irrespective of the form of language used for the purposes described in this section.`,
        data: {},
        subparagraph: []
      },
      {
        id: 3,
        paragraph: 3,
        name: `Grantor may add or remove trust property at any time and for any purpose; Grantor retains 
          fully the unrestricted right to direct and control the distribution of income and principal of the 
          trust, up to and including exhausting all the trust property for the Grantor's benefit.`,
        data: {},
        subparagraph: []
      },
    ],
    }
  ];
  

  function ListItem({ item }) {
    let children = null;
    if (item.values && item.values.length) {
      children = (
        <ol>
          {item.values.map(i => (
            <ListItem item={i} key={i.id} />
          ))}
        </ol>
      );
    }
    return (
      // <li>
      // <li style={{listStyleType: "lower-alpha"}}>
      <li className="ol">
        {item.name}
        {children}
      </li>
    );
  }




export default function PDFFile(props) {

  return (
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>

      <h1>THE TRUST</h1>      
      
      <ol>
      {DocumentComps.map(i => (
        <ListItem item={i} key={i.id} />
      ))}
      </ol>



      {/* <Document>
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
      </Document> */}
    </div>
  );
};


{/* <h1>Goal</h1>
      
<ol>
<li>Element 1
  <ol>
    <li>Sub element 1</li>
      <ol>
      <li>Sub Sub element 1</li>
      <li>Sub Sub element 2</li>
      </ol>
    <li>Sub element 2</li>
    <li>Sub element 3</li>
  </ol>
</li>
<li>Element 2</li>
<li>Element 3
  <ol>
    <li>Sub element 1</li>
    <li>Sub element 2</li>
    <li>Sub element 3</li>
  </ol>
</li>
</ol> */}