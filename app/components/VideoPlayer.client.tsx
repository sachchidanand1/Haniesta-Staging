'use client';

import {useEffect, useState} from 'react';

// Simple component type for the dynamically imported ReactPlayer
type ReactPlayerType = (props: any) => JSX.Element;

// Use a broad props type so we can pass through any ReactPlayer props we need
export type VideoPlayerProps = {
  url: string;
  [key: string]: any;
};

export default function VideoPlayer(props: VideoPlayerProps) {
  const [ReactPlayer, setReactPlayer] = useState<ReactPlayerType | null>(null);

  useEffect(() => {
    let mounted = true;

    // Import ReactPlayer only in the browser
    import('react-player')
      .then((mod) => {
        if (!mounted) return;
        setReactPlayer(() => mod.default as ReactPlayerType);
      })
      .catch(() => {
        // Swallow import errors to avoid breaking the page if react-player fails to load
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ReactPlayer) return null;

  return <ReactPlayer {...props} />;
}
