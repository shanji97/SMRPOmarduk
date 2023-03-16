import classes from './ValidationError.module.css';

const ValidationError: React.FC<{children: string}> =  ({children}) => {
    return <span className={classes.error}>{children}</span>
}

export default ValidationError;