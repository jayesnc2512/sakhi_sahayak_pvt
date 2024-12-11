import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import JSMpeg from '@cycjimmy/jsmpeg-player';

const StyledVideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  width: 100%;
`;

const PlayButton = styled.button`
  
  transform: translate(-50%, -50%);
  font-size: 14px;
  cursor: pointer;
`;

const Player = ({ videoUrl }) => {
  const videoCanvasRef = useRef(null);

  useEffect(() => {
    if (videoCanvasRef.current) {
      new JSMpeg.VideoElement(videoCanvasRef.current, videoUrl, { autoplay: true });
    }
  }, [videoUrl]);

  return (
    <StyledVideoContainer ref={videoCanvasRef}></StyledVideoContainer>
  );
};

export default Player;
