import React from "react";

import classes from './Card.module.css';

interface CardProps {
    children: any,
    style?: object,
    classNames?: string,
}

const Card: React.FC<CardProps> = ({children, style, classNames}) => {
    const styles = classNames ? `${classes.card} ${classNames}` : classes.card;

    return <div style={style} className={styles}>
        {children}
    </div>
}

export default Card;
