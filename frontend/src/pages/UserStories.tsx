import {Table} from "react-bootstrap";
import Card from "../components/Card";

const UserStories = () => {
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
        <th>Tests</th>
      </tr>
      </thead>
      <tbody>

      </tbody>
    </Table>
  </Card>
}

export default UserStories;
