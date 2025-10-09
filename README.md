# SpaceTrash Hack: Mars Recycling System

A comprehensive solution for managing, recycling, and manufacturing resources on Mars, developed for the 2025 NASA Space Apps Challenge.

![Project Banner](src/renderer/src/assets/images/(modules)/circular-module_1-Photoroom.png)

## 🚀 Project Overview

SpaceTrash Hack is an innovative system designed to revolutionize waste management and resource utilization on Mars. Our solution addresses the critical challenge of managing inorganic waste during long-term Mars missions, where transporting additional resources from Earth or returning waste is impractical and expensive.

### Key Features

- **Smart Bin System**: Automated waste collection and sorting across habitat modules
- **Advanced Recycling Processes**: Multiple recycling pathways for different material types
- **Manufacturing Lab**: In-situ resource utilization and manufacturing capabilities
- **Real-time Monitoring**: Visual analytics and status tracking
- **Resource Management**: Efficient tracking and utilization of available materials

## 💡 How It Works

### 1. Smart Bin Network

- **Distributed Collection**: Smart bins placed strategically across different habitat modules
- **Real-time Monitoring**: Each bin tracks fill levels and material composition
- **Automated Sorting**: Materials are pre-sorted at collection points
- **Mobile vs. Static Bins**: Combination of mobile indoor bins and stationary processing bins

### 2. Material Processing

Our system handles various material categories:
- **Fabrics**: Clothing, towels, wipes (cotton, polyester, nylon)
- **Plastics**: Packaging, containers, utensils
- **Metals**: Structural elements, wiring, containers
- **Glass**: Laboratory equipment, viewports
- **Paper**: Documentation, packaging
- **Composites**: Multi-material items

### 3. Recycling Processes

Advanced recycling algorithms determine optimal processing paths:
- **Mechanical Processing**: Shredding, grinding, cutting
- **Thermal Processing**: Melting, extrusion
- **Chemical Processing**: Material separation, purification
- **Fiber Processing**: Extraction, separation

### 4. Manufacturing Capabilities

Three primary manufacturing categories:
1. **Renovation** - Habitat infrastructure and improvements
   - Structural components
   - Insulation materials
   - Storage solutions

2. **Discovery** - Scientific and exploration equipment
   - Laboratory equipment
   - Sample containers
   - Protective gear

3. **Celebration** - Community and recreational items
   - Decorative elements
   - Event supplies
   - Personal items

### 5. Mars Regolith Integration

- Unlimited access to Mars regolith (MGS-1 Mars Global Simulant)
- Integration with manufactured items for enhanced properties
- Specialized processing techniques for regolith-based materials

## 🛠 Technical Implementation

### Architecture

- **Frontend**: React with TypeScript
- **Backend**: Electron for desktop integration
- **State Management**: React Hooks and Context
- **Database**: MongoDB database for data storage

### Key Algorithms

1. **Material Availability Calculation**
   - Real-time tracking of available materials
   - Prediction of recycling outputs
   - Manufacturing feasibility assessment

2. **Recycling Process Optimization**
   - Multi-step process planning
   - Resource utilization efficiency
   - Output quality optimization

3. **Manufacturing Priority System**
   - Resource allocation
   - Production scheduling
   - Quality control metrics

## 🖥 Navigation Guide

### Main Modules

1. **Dashboard**
   - System overview
   - Key metrics
   - Alert notifications

2. **Habitat Modules**
   - Module-specific information
   - Bin management
   - Local statistics

3. **Recycling Station**
   - Processing controls
   - Material inventory
   - Recycling analytics

4. **Manufacturing Lab**
   - Available materials
   - Manufacturing options
   - Production queue

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dee000888/NSAC_2025.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

### Building for Production

```bash
# For Windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```
---

**Note**: This project is part of the 2025 NASA Space Apps Challenge and is intended as a prototype solution for Mars mission waste management.