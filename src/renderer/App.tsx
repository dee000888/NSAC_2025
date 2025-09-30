import * as React from 'react';
import './styles.css';
import anime from 'animejs';

const App: React.FC = () => {
  const handleClick = () => {
    anime({
      targets: '#animated-div',
      translateX: 100,
      scale: 1.5,
      rotate: '1turn',
      duration: 1000,
      easing: 'easeInOutQuad',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Electron with Tailwind and Anime.js
      </h1>
      <div
        id="animated-div"
        className="w-16 h-16 bg-blue-500 rounded-full"
      ></div>
      <button
        onClick={handleClick}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Animate!
      </button>
    </div>
  );
};

export default App;
