import React from "react";

export default function MainInfomation(props: any): React.ReactElement {

  return (
    <div className="absolute inset-0 flex items-center justify-start w-96 h-fit top-1/3 p-4 ml-40 rounded bg-gray-950 
      bg-opacity-40 backdrop-blur-md text-white">
      {props.children}
    </div>
  );
}
