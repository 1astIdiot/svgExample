import React, { useEffect, useState } from 'react';

function Pin(props) {
    const [currentElem, setCurrentElem] = useState({});

    useEffect(() => {
        if (props.data.length > 0 && props.dataId !== '') {
            setCurrentElem(props.data.find(item => {
                console.log('item: ', item);
                console.log('props.dataId: ', props.dataId);
                console.log('item.id === props.dataId: ', item.id === props.dataId);
                console.log('');
                return item.id === props.dataId;
            }));
        }
    }, [props.data])

    return (
            <svg
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
                version="1"
                viewBox="0 0 2500 630.119"
                fill="red"
            >
                <path
                    fill="#010002"
                    d="M249.462 0C151.018 0 70.951 80.106 70.951 178.511c0 92.436 133.617 192.453 172.248 315.948a6.368 6.368 0 006.116 4.465 6.377 6.377 0 006.048-4.563c37.478-126.533 172.6-223.307 172.609-315.869C427.963 80.106 347.886 0 249.462 0zm0 313.925c-77.184 0-139.987-62.812-139.987-139.987 0-77.184 62.803-139.987 139.987-139.987 77.165 0 139.977 62.803 139.977 139.987 0 77.175-62.813 139.987-139.977 139.987z"
                />
                <g>
                    <circle cx='10%' cy='27%' r="148" stroke="black" strokeWidth="3" fill="white" />
                    <text x='10%' y='27%' textAnchor="middle" alignmentBaseline="middle" fontSize="125px" fill="black" >
                        {currentElem.count}
                    </text>
                </g>
            </svg>
    );
}

export default Pin;
