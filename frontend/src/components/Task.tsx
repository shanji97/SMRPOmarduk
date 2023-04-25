import { Fragment, useState } from "react";
import { Button } from "react-bootstrap";
import LogTimeModal from "./LogTimeModal";

interface TaskProps {
    task: any
}

const Task: React.FC<TaskProps> = ({task}) => {
    const [showModal, setShowModal] = useState(false);

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
                <td ><Button className="align-middle text-decoration-none" variant="link">{task.status}</Button></td>
                
                <td >{task.spent}</td>
                <td >{task.remaining}</td>
                <td >{task.estimatedTime}</td>
                <td ><Button variant="outline-primary" size="sm" onClick={openLogTimeModal}>Work History</Button></td>
            </tr>
            {showModal && <LogTimeModal taskId={task.id} showModal={showModal} hideModal={hideModal} />}
        </Fragment>
    )
}

export default Task;
