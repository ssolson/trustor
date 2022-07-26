import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Table, Tag, Button } from "antd";
 

const Record = (props) => (
 <tr>
   <td>{props.record.name}</td>
   <td>{props.record.position}</td>
   <td>{props.record.trust_address}</td>
   <td>      
      <Button
          type={"primary"}
          onClick={() => {
            props.deleteRecord(props.record._id) }
          } 
          >
          Delete
      </Button>
   </td>
 </tr>
);
 
export default function TrustList(props) {
 const [records, setRecords] = useState([]);
 
 const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    
  },
  {
    title: 'Address',
    dataIndex: 'trust_address',
    key: 'trust_address',
    render:text=><Link to={`${text}`}>{text}</Link>
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: 'Action',
    dataIndex: 'del',
    key: '_id',
    render: (text, record) => (
      <button 
        onClick={async ()=> {
          console.log('record',record)
          console.log('_id',record._id)

          await fetch(`http://localhost:5000/${record._id}`, {
            method: "DELETE"
          });
        
          const newRecords = records.filter((el) => el._id !== record._id);
          setRecords(newRecords);
          console.log('newRecords',newRecords)

        }}
        >
        {"Delete"}
      </button>
    )
    // render: ()=><Link onClick={props.deleteRecord(props.record._id)}>{Delete}</Link>
    // render: text=>{
    // <Button 
    //   type={"primary"}
    //   onclick={
    //     async (text)=> {
    //       await fetch(`http://localhost:5000/${text}`, {
    //       method: "DELETE"
    //     });
      
    //     const newRecords = records.filter((el) => el._id !== text);
    //     setRecords(newRecords);
    //     }
    //   } 
    // >
    // Delete
    // </Button >}

  },
];



 // This method fetches the records from the database.
 useEffect(() => {
   async function getRecords() {
     const response = await fetch(`http://localhost:5000/record/`);
 
     if (!response.ok) {
       const message = `An error occurred: ${response.statusText}`;
       window.alert(message);
       return;
     }
 
     const records = await response.json();
     console.log('records',records);
     setRecords(records);
   }
 
   getRecords();
 
   return;
 }, [records.length]);
 
 // This method will delete a record
 async function deleteRecord(id) {
   await fetch(`http://localhost:5000/${id}`, {
     method: "DELETE"
   });
 
   const newRecords = records.filter((el) => el._id !== id);
   setRecords(newRecords);
 }
 

 
 const onClick = (e) => {
  console.log('Content: ', e.currentTarget.dataset.id);
}

 // This following section will display the table with the records of individuals.
 return (
   <div>
      <div style={{ padding: 25, marginTop: 100, width: 400, margin: "auto" }}/>
     <h3>Your Trusts</h3>
     <Table
      columns={columns}
      dataSource={records}
      // pagination={pagination}
      // loading={loading}
      // onChange={handleTableChange}
    />
  <NavLink className="nav-link" to="/your-trusts/new">
    <Button type={"primary"}>
      New Trust     
    </Button >
  </NavLink>

   </div>
 );
}