import { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import classes from "./AddStory.module.css";
import useValidateForm from "../hooks/useValidateForm";

const AddSubtask = () => {
  const [subtaskData, setSubtaskData] = useState({
    description: "",
    time: "",
    ownerID: "",
  });

  // TODO get this from backend - this is just sample data
  const allUsers: { id: string; name: string }[] = [
    {
      id: "asdsadsadadsa",
      name: "Tim",
    },
    {
      id: "zzzzzzzz",
      name: "Jim",
    },
  ];

  const [businessValueError, setBusinessValueError] = useState(false);

  const { description, time, ownerID } = subtaskData;

  const subtaskDataChangedHandler = (e: any) => {
    console.log(e.target.name, e.target.value);
    setSubtaskData((prevSubtaskData) => ({
      ...prevSubtaskData,
      [e.target.name]: e.target.value,
    }));
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO send data to backend via service
    console.log(subtaskData);

    setSubtaskData({
      description: "",
      time: "",
      ownerID: "",
    });
  };

  return (
    <Card>
      <h1 className="text-primary">Add subtask</h1>
      <Form onSubmit={submitFormHandler}>
        <Form.Group className="mb-3" controlId="form-title">
          <Form.Label>Description</Form.Label>
          <Form.Control
            placeholder="Add subtask description"
            name="description"
            value={description}
            onChange={subtaskDataChangedHandler}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="form-title">
          <Form.Label>Estimated duration</Form.Label>
          <Form.Control
            placeholder="Add subtask duration"
            name="time"
            value={time}
            onChange={subtaskDataChangedHandler}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="form-priority">
          <Form.Label>Subtask owner (optional)</Form.Label>
          <Form.Select
            aria-label="Select subtask owner"
            onChange={subtaskDataChangedHandler}
            value={ownerID}
            name="ownerID"
          >
            <option value="">Select subtask owner</option>
            {allUsers.map((user) => (
              <option value={`${user.id}`}>{user.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          size="lg"
          //   disabled={!formIsValid}
        >
          Add story
        </Button>
      </Form>
    </Card>
  );
};

export default AddSubtask;
