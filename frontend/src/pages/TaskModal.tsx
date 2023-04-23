import { Button, Modal } from "react-bootstrap";
import { StoryData } from "../classes/storyData";
import { useAppDispatch } from "../app/hooks";
import { getAllUsers } from "../features/users/userSlice";
import { useEffect } from "react";











export interface StoryModalProps {
    onCancel: VoidFunction
    show: boolean
    item: StoryData
}

function TaskModal({ 
    onCancel,
    show,
    item,
}: StoryModalProps) {



    const dispatch = useAppDispatch();

    useEffect(() => {
      dispatch(getAllUsers())
    }, [])

    return (


        <Modal
        
        show={show} 
        
        onHide={onCancel}
        backdrop="static"
        keyboard={false}
        size="xl"
        centered>
             <Modal.Header
          closeButton
        >
          <Modal.Title>Extra Large Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body>Large React-Bootstrap Modal<br />Testing Modal Height</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={onCancel}>
            Close
          </Button>
        </Modal.Footer>
    </Modal>
    )


}


export default TaskModal;