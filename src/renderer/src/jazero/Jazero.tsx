import React from 'react'
import marsImage from '../assets/images/mars.jpg';
import Residence from './Residence';
import MainInfomationPane from '@renderer/components/MainInfomationPane';

export default function MarsBackground(): React.ReactElement {
  return (
    <div className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${marsImage})` }}
    >
      <MainInfomationPane />
      <Residence />
    </div>
  )
}
