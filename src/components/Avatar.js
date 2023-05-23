import React, {useEffect} from 'react';
import {useStoreState} from "easy-peasy";
import Image from 'next/image';
import classNames from 'classnames';


export default function Avatar ({width, height, className, onClick, url}) {
    let w = width || 48
    let h = height || 48
    const [imgSrc, setImgSrc] = React.useState(url ? url : 'https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/avatar/default.jpg');

    useEffect(() => {
        setImgSrc(url ? url : 'https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/avatar/default.jpg')
    }, [url])
    const fallback = () => {
        setImgSrc('https://s3.eu-west-2.amazonaws.com/cdn.flowcook.com/avatar/default.jpg');
    }

  return (
      <div>
          <img id="avatar" onClick={onClick} width={w} height={h} src={imgSrc} onError={() => fallback()} alt={'profile picture'} className={classNames(className, 'rounded-full')}></img>
      </div>

  );
}
