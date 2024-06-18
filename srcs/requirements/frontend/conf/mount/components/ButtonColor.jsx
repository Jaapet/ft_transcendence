import React from 'react';

const ButtonColor = ({ color, handleColorChange }) => {
  return (

    <button
      style={{
        backgroundColor: color,
        width: '30px',
        height: '30px',
        marginBottom: '5px',
        borderRadius: '50%',
        border: '1px solid black',
      }}
      onClick={() => handleColorChange(color)}
    ></button>
  );
};

export default ButtonColor;
