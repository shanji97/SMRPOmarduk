import {Table} from "react-bootstrap";
import {Check, PencilFill, X} from "react-bootstrap-icons";

const DUMMY_USERS = [
    {
        username: 'tinec',
        password: '123123',
        name: 'Tine',
        surname: 'Crnugelj',
        email: 'tine.crnugelj@gmail.com',
        isAdmin: false
    },
    {
        username: 'martind',
        password: '123123',
        name: 'Martin',
        surname: 'Dagarin',
        email: 'martin.dagarin@gmail.com',
        isAdmin: true
    },
    {
        username: 'simonk',
        password: '123123',
        name: 'Simon',
        surname: 'Klavzar',
        email: 'simon.klavzar@gmail.com',
        isAdmin: false
    },
    {
        username: 'matevzl',
        password: '123123',
        name: 'Matevz',
        surname: 'Lapajne',
        email: 'matevz.lapajne@gmail.com',
        isAdmin: true
    },
]

const Users = () => {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Email</th>
                    <th>Admin</th>
                </tr>
            </thead>
            <tbody>
                {DUMMY_USERS.map((user, i) => {
                    return (
                        <tr key={i}>
                            <td>{i+1}</td>
                            <td>
                                <div>
                                    {user.username}
                                    <PencilFill />
                                </div>
                            </td>
                            <td>{user.password}</td>
                            <td>{user.name}</td>
                            <td>{user.surname}</td>
                            <td>{user.email}</td>
                            <td>{user.isAdmin ? <Check size={30} color='green' /> : <X size={30} color='red' />}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default Users;
