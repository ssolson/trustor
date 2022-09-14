import React, {useState, useEffect} from "react";
import ReactMarkdown from 'react-markdown'
import ReactDOM from 'react-dom'
// import { Page, Text, Image, Document, StyleSheet } from "@react-pdf/renderer";
import {
  Button,
} from 'antd';
import './PDFFile.css';
import trustLang from '../templates/trustTemplate.json';
import trustMD from '../templates/eg/content/shortTrust.md';


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








// TODO: Get Data from Database
const trustCreationDate = '05 September 2022'
const trustName = 'Trust 1'

// Must Define Database Values  first
const DocumentComps = [
  {
    id: 0,
    value: "Preface",
    children: [
      {
        id: 1,
        value: `This is an express inter vivos trust 
          (i.e., revocable living trust), created this 
          ${trustCreationDate}, the terms of which are wholly 
          expressed in this instrument, except for those 
          incorporated by reference.`,
      },
      {
        id: 2,
        value: `The form of delivery of this trust instrument
          is known as a “smart contract,” which digitally instantiates 
          the terms of this trust instrument for global implementation 
          across all digital and cyber networks, platforms, and systems, 
          which serves to enable the administration of property subject 
          to this trust that is of either digital, physical, or of mixed 
          nature, regardless of medium or media wherein the trust property 
          manifests existence.`,
      }
    ],
  },
  {
    id: 1,
    value: "Article One",
    children: [
      {
        id: 1,
        value: `For purposes of identification, this trust is referred to as ${trustName}.`,
      },
      {
        id: 2,
        value: `Grantor reserves the power to act on behalf of this
          trust without limitation, and may amend, restate, or revoke 
          this trust at any time, for any purpose, in whole or in part 
          by republication of this trust in writing, whether expressed 
          digitally or otherwise, and irrespective of the form of language
          used for the purposes described in this section.`,
      },
      {
        id: 3,
        value: `Grantor may add or remove trust property at any time 
          and for any purpose; Grantor retains fully the unrestricted 
          right to direct and control the distribution of income and 
          principal of the trust, up to and including exhausting all 
          the trust property for the Grantor's benefit.`,
      },
    ],
    }
  ];
  

function ListItem({ item }) {
  let children = null;
  if (item.children && item.children.length) {
    children = (
      <ol>
        {item.children.map(i => (
          <ListItem item={i} key={i.id} />
        ))}
      </ol>
    );
  }
  return (
    <li className="ol">
      {item.value}
      {children}
    </li>
  );
}




export default function PDFFile(props) {

  const [text, setText] = React.useState();
  const TrustLanguage = trustLang['data'][0]['contents']


  useEffect(() => {
    fetch(trustMD)
    .then(res => res.text())
    .then(res => setText({ markdown: res }))
    // .then(console.log(text));
  }, [trustMD]);


  const clickHandler = () => {
    // fetch(fileName)
    //   .then((response) => response.text())
    //   .then((textContent) => {
    //     setText(textContent);
    //   });
    return text || "Loading...";
    } 


  return (
    
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>

      <h1>THE TRUST</h1>      

      <ReactMarkdown children={text['markdown']}></ReactMarkdown>


      
      
    <div>
      <Button
      type={"primary"}
      onClick={
        async () => {
          console.log("You clicked the button!");
          console.log(text)
          // console.log("trustLang", typeof  trustLang['data'][0]['contents'])
        }
      }
    >  
        Click it
    </Button>
    </div>

      
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


