import { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import Card from "../components/Card";
import { Form } from "react-bootstrap";

import classes from "./AddStory.module.css";

const AddSubtask = () => {
  const [subtaskData, setSubtaskData] = useState({
    description: "",
    time: 0,
    ownerUsername: "",
  });

  // TODO get this from backend - this is just sample data
  const DUMMY_USERS = [
    {
      username: "tinec",
      password: "123123",
      name: "Tine",
      surname: "Crnugelj",
      email: "tine.crnugelj@gmail.com",
      isAdmin: false,
    },
    {
      username: "martind",
      password: "123123",
      name: "Martin",
      surname: "Dagarin",
      email: "martin.dagarin@gmail.com",
      isAdmin: true,
    },
    {
      username: "simonk",
      password: "123123",
      name: "Simon",
      surname: "Klavzar",
      email: "simon.klavzar@gmail.com",
      isAdmin: false,
    },
    {
      username: "matevzl",
      password: "123123",
      name: "Matevz",
      surname: "Lapajne",
      email: "matevz.lapajne@gmail.com",
      isAdmin: true,
    },
  ];

  const { description, time, ownerUsername } = subtaskData;

  const subtaskDataChangedHandler = (e: any) => {
    setSubtaskData((prevSubtaskData) => ({
      ...prevSubtaskData,
      [e.target.name]: e.target.value,
    }));
  };

  let formHasError = subtaskData.description === "" || subtaskData.time <= 0;

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO send data to backend via service
    console.log(subtaskData);

    setSubtaskData({
      description: "",
      time: 0,
      ownerUsername: "",
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
          <Form.Label>Estimated duration (in hours)</Form.Label>
          <Form.Control
            placeholder="Add subtask duration"
            name="time"
            value={time}
            onChange={subtaskDataChangedHandler}
            type="number"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="form-priority">
          <Form.Label>Subtask owner (optional)</Form.Label>
          <Form.Select
            aria-label="Select subtask owner"
            onChange={subtaskDataChangedHandler}
            value={ownerUsername}
            name="ownerUsername"
          >
            <option value="">Select subtask owner</option>
            {DUMMY_USERS.map((user) => (
              <option value={`${user.username}`} key={user.username}>
                {user.username}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          size="lg"
          disabled={formHasError}
        >
          Add subtask
        </Button>
      </Form>
    </Card>
  );
};

export default AddSubtask;
