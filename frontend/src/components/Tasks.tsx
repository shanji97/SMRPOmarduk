import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
//import { getAllTasks } from "../features/tasks/taskSlice";
import { Button } from "react-bootstrap";
import { getTasksForStory } from "../features/tasks/taskSlice";
//import LogTimeModal from "./LogTimeModal";

interface TasksProps {
    storyId: string
}

const Tasks: React.FC<TasksProps> = ({storyId}) => {
    const dispatch = useAppDispatch();
    const {tasksForStory} = useAppSelector(state => state.tasks);
    const [showModal, setShowModal] = useState(false);

    console.log(tasksForStory);

    useEffect(() => {
        dispatch(getTasksForStory(storyId));
    }, []);

    const openLogTimeModal = () => {
        setShowModal(true);
    }

    const hideModal = () => {
        setShowModal(false);
    }

    return (
        <Fragment>
            {tasksForStory.map(task => {
                return (
                    <tr key={task.id}>
                        <td >{task.id}</td>
                        <td >{task.name}</td>
                        <td ><Button className="align-middle text-decoration-none" variant="link">{task.status}</Button></td>
                        
                        <td >{task.workedTime}</td>
                        <td >{task.remaining}</td>
                        <td >{task.estimatedTime}</td>
                        <td ><Button variant="outline-primary" size="sm" onClick={openLogTimeModal}>Work History</Button></td>
                    </tr>
                )
            })}
            {/*showModal && <LogTimeModal showModal={showModal} hideModal={hideModal} />*/}
        </Fragment>
    )

    return <h1>asd</h1>
}

export default Tasks;