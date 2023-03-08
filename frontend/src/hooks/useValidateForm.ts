import { useMemo } from "react";

const useValidateForm = (fields: { [key: string]: any }) => {
    const formIsValid = useMemo(() => {
        return !Object.values(fields).some(field => field === '');
    }, [fields]);

    return formIsValid;
}

export default useValidateForm;
