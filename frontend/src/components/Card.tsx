import React, { ReactElement } from "react";

import classes from './Card.module.css';

const Card: React.FC<{children: ReactElement | ReactElement[]}> = ({children}) => {
    return <div className={classes.card}>
        {children}
    </div>
}

export default Card;
