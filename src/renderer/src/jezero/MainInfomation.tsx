import React from "react";

export default function MainInfomation(props: any): React.ReactElement {
  return (
    <div className="absolute inset-0 flex items-center justify-start">
      <div className="p-4 ml-40 flex flex-col justify-center rounded bg-gray-950 bg-opacity-40 backdrop-blur-md text-white">
        {props.children}
      </div>
    </div>
  );
}
