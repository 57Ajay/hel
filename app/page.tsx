"use client";
import { Fragment, useState } from 'react'
export default function Home() {
  const [data, setData] = useState();
  const handleClick = async () => {
    const res = await fetchdata();
    setData(res);
  }
  return (
    <Fragment>
      <p className='text-5xl bg-red-800 font-semibold'>message</p>
      <p className='text-5xl bg-blue-800 font-semibold'>Data</p>
      <button onClick={handleClick}>Fetch Data</button>
      {data && <p>{data.message}</p>}
    </Fragment>
  )
}
const fetchdata = async () => {
  const res = await fetch('/api/hello');
  const data = await res.json();
  return data;
}
