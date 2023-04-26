import { Fragment, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import LogTimeModal from "./LogTimeModal";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getWorkLogs } from "../features/tasks/taskSlice";

interface TaskProps {
    task: any
}

const Task: React.FC<TaskProps> = ({task}) => {
    const dispatch = useAppDispatch();
    const {workLogs} = useAppSelector(state => state.tasks);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        dispatch(getWorkLogs(task.id!));
    }, []);

    const hoursSpentInTotal = useMemo(() => {
        let sum = 0;
        workLogs.forEach(log => {
            sum += log.spent;
        })
        return sum;
    }, [workLogs]);
    
    const getStatusFromCategory = (category: number) => {
        switch(category) {
            case 0:
              return 'UNKNOWN'
              break;
            case 1:
              return 'UNASSIGNED'  
              break;
            case 2:
              return 'ASSIGNED'                
              break;
            case 3:
              return 'ACCEPTED'
              break;
            case 4:
                return 'ACTIVE'
              break;
            case 250:
                return 'ENDED'                
              break;
            default:
              return 'UNKNOWN'
        }
    }

    const openLogTimeModal = () => {
        setShowModal(true);
    }

    const hideModal = () => {
        setShowModal(false);
    }

    return (
        <Fragment>
            <tr key={task.id}>
                <td >{task.id}</td>
                <td >{task.name}</td>
                <td>{getStatusFromCategory(task.category)}</td>
                
                <td >{hoursSpentInTotal}h</td>
                <td>{`${workLogs?.[workLogs.length - 1]?.remaining}h` ?? '/'}</td>
                <td >{task.estimatedTime}</td>
                <td ><Button variant="outline-primary" size="sm" onClick={openLogTimeModal}>Work History</Button></td>
            </tr>
            {showModal && <LogTimeModal taskId={task.id} showModal={showModal} hideModal={hideModal} />}
        </Fragment>
    )
}

export default Task;
