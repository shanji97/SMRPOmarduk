import {Button, Dropdown, DropdownButton, Form, Modal, Table} from "react-bootstrap";
import Card from "../components/Card";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import React, {useEffect, useState} from "react";
import {getAllStoriesOfProject, realizeStory, reset} from "../features/stories/storySlice";
import {useParams} from "react-router-dom";
import {Check, X} from "react-bootstrap-icons";
import {toast} from "react-toastify";
import QRCode from "react-qr-code";

const UserStories = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const {storiesOfProject, message, isError} = useAppSelector(state => state.stories);

  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getAllStoriesOfProject(params.projectID!));

    return () => {
      dispatch(reset())
    }
  }, [isError, message]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.currentTarget.value);
  }

  const handleAccept = (storyId: string) => {
    dispatch(realizeStory(storyId));
  }

  const handleReject = () => {
    setShowModal(true);
  }

  const submitReject = () => {
    console.log(comment);
    closeModal();
  }

  const closeModal = () => {
    setShowModal(false);
  }

  const renderModal = () => {
    return (
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Reject story</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Why are you rejecting this story?</p>
          <Form.Group className="mb-3" controlId="formBasicComment">
            <Form.Control
              placeholder="Your comment"
              name="comment"
              value={comment}
              onChange={handleCommentChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button variant="primary" onClick={submitReject}>Save</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return <Card style={{ width: "70%", marginTop: "1rem" }}>
    <h1>Stories for current sprint</h1>
    <Table striped bordered hover>
      <thead>
      <tr>
        <th>#</th>
        <th>Title</th>
        <th>Description</th>
        <th>Business Value</th>
        <th>Priority</th>
        <th>Acceptance Tests</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      {storiesOfProject.map((story, index) => {
        return (
          <tr key={index}>
            <td>{index+1}</td>
            <td>{story.title}</td>
            <td>{story.description}</td>
            <td>{story.businessValue}</td>
            <td>{story.priority}</td>
            {/* TODO tests */}
            <td>
              <ul>
                {story.tests.map((test, i) => {
                  return <li>{test.description}</li>
                })}
              </ul>
            </td>
            <td>
              <div style={{ display: 'inline-flex' }}>
                <Button disabled={story.isRealized} onClick={() => {handleAccept(story.id!)}} variant='success'><Check /></Button>
                <Button onClick={handleReject} variant='danger'><X /></Button>
              </div>
            </td>
          </tr>
        );
      })}
      </tbody>
    </Table>
    {showModal && renderModal()}
  </Card>
}

export default UserStories;
