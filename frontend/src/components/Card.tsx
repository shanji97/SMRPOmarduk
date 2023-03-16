import React from "react";

import classes from './Card.module.css';

interface CardProps {
    children: any,
    style?: object,
}

const Card: React.FC<CardProps> = ({children, style}) => {
    return <div style={style} className={classes.card}>
        {children}
    </div>
}

export default Card;
